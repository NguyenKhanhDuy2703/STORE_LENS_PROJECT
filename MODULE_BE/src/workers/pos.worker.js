const xlsx = require('xlsx');
const BusinessEvent = require('../schemas/businessEvent.schema');
const Asset = require('../schemas/asset.schema');
const logger = require('../utils/logging');
const locationStatsWorker = require('./locationStats.worker');

const posWorker = {
    async processExcel(buffer, location_id) {
        try {
            logger.info(`[posWorker] Bắt đầu xử lý file Excel cho location: ${location_id}`);
            
            // 1. Đọc file từ buffer
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert ra JSON
            const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });
            
            if (!data || data.length === 0) {
                logger.warn(`[posWorker] File Excel trống hoặc không đúng định dạng`);
                return;
            }

            // Fetch toàn bộ Asset của location để lookup item_id
            const assets = await Asset.find({ location_id }).select('_id name_product product_id').lean();
            const assetMap = {}; // key: name_product, value: _id
            const productIdMap = {}; // key: product_id, value: _id
            assets.forEach(a => {
                if (a.name_product) assetMap[a.name_product.trim().toLowerCase()] = a._id.toString();
                if (a.product_id) productIdMap[a.product_id.trim().toLowerCase()] = a._id.toString();
            });

            // 2. Gom nhóm theo event_code
            const eventsMap = {};
            for (const row of data) {
                // Đọc các cột chuẩn (hỗ trợ cả tiếng Việt và tiếng Anh)
                const event_code = row['Mã Hóa Đơn'] || row['event_code'];
                const rawDate = row['Ngày Giao Dịch'] || row['date'];
                let total_amount = row['Tổng Tiền'] || row['total_amount'];
                let discount = row['Giảm Giá'] || row['discount'];
                const item_name = row['Tên Hàng'] || row['item_name'];
                let quantity = row['Số Lượng'] || row['quantity'];
                let unit_price = row['Đơn Giá'] || row['unit_price'];

                // Clean and convert numbers
                if (typeof total_amount === 'string') total_amount = Number(total_amount.replace(/,/g, ''));
                if (typeof discount === 'string') discount = Number(discount.replace(/,/g, ''));
                if (typeof quantity === 'string') quantity = Number(quantity.replace(/,/g, ''));
                if (typeof unit_price === 'string') unit_price = Number(unit_price.replace(/,/g, ''));

                total_amount = Number(total_amount || 0);
                discount = Number(discount || 0);
                quantity = Number(quantity || 1);
                unit_price = Number(unit_price || 0);
                const payment_method = row['Phương Thức Thanh Toán'] || row['payment_method'] || 'Tiền mặt';
                
                if (!event_code) continue; // Bỏ qua dòng thiếu mã hóa đơn

                if (!eventsMap[event_code]) {
                    // Xử lý Date từ Excel (có thể là số seri excel hoặc string ISO)
                    let parsedDate = new Date();
                    if (typeof rawDate === 'number') {
                        parsedDate = new Date((rawDate - (25567 + 2)) * 86400 * 1000); // Công thức Excel Date sang JS Date
                    } else if (rawDate) {
                        parsedDate = new Date(rawDate);
                    }
                    if (isNaN(parsedDate.getTime())) parsedDate = new Date();

                    eventsMap[event_code] = {
                        location_id,
                        event_code: String(event_code),
                        date: parsedDate,
                        total_amount,
                        discount,
                        payment_method: String(payment_method),
                        type: 'POS_IMPORT',
                        status: 'COMPLETED',
                        event_details: []
                    };
                }

                // Thêm detail nếu có
                if (item_name) {
                    const cleanItemName = String(item_name).trim();
                    const lookupKey = cleanItemName.toLowerCase();
                    // Match item_id bằng name_product hoặc product_id
                    const item_id = assetMap[lookupKey] || productIdMap[lookupKey] || null;

                    eventsMap[event_code].event_details.push({
                        item_id: item_id,
                        item_name: cleanItemName,
                        quantity,
                        unit_price,
                        total_price: quantity * unit_price
                    });
                }
            }

            const eventsToInsert = Object.values(eventsMap);
            if (eventsToInsert.length === 0) {
                logger.warn(`[posWorker] Không tìm thấy dữ liệu hợp lệ trong file`);
                return;
            }

            // 3. BulkWrite để tăng tốc
            const bulkOps = eventsToInsert.map(event => ({
                updateOne: {
                    filter: { event_code: event.event_code },
                    update: { $set: event },
                    upsert: true
                }
            }));

            const result = await BusinessEvent.bulkWrite(bulkOps);
            logger.info(`[posWorker] Đã xử lý ${eventsToInsert.length} hóa đơn. Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);

            // 4. Trigger đồng bộ lại Location Stats
            const today = new Date();
            today.setHours(0,0,0,0);
            const nextDay = new Date(today);
            nextDay.setDate(nextDay.getDate() + 1);

            await locationStatsWorker.kpisProcessor({ locationId: location_id, today, nextDay });
            await locationStatsWorker.chartDataProcessor({ locationId: location_id, today, nextDay });
            logger.info(`[posWorker] Hoàn tất cập nhật KPIs và Chart Data cho location ${location_id}`);

        } catch (error) {
            logger.error(`[posWorker] Lỗi khi xử lý Excel: ${error.message}`);
        }
    }
};

module.exports = posWorker;
