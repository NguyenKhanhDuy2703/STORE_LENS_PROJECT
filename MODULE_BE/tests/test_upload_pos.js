const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const axios = require('axios');
const FormData = require('form-data');

async function runTest() {
    console.log('1. Đang tạo file Excel mẫu (Input)...');
    const data = [
        {
            "Mã Hóa Đơn": "POS-001",
            "Ngày Giao Dịch": "2026-05-10T14:00:00.000Z",
            "Tổng Tiền": 100000,
            "Giảm Giá": 5000,
            "Tên Hàng": "Nước suối Aquafina",
            "Số Lượng": 2,
            "Đơn Giá": 10000,
            "Phương Thức Thanh Toán": "MOMO"
        },
        {
            "Mã Hóa Đơn": "POS-001", // Cùng mã hóa đơn để test gom nhóm
            "Ngày Giao Dịch": "2026-05-10T14:00:00.000Z",
            "Tổng Tiền": 100000,
            "Giảm Giá": 5000,
            "Tên Hàng": "Bánh Snack",
            "Số Lượng": 4,
            "Đơn Giá": 20000,
            "Phương Thức Thanh Toán": "MOMO"
        },
        {
            "Mã Hóa Đơn": "POS-002",
            "Ngày Giao Dịch": "2026-05-10T15:30:00.000Z",
            "Tổng Tiền": 550000,
            "Giảm Giá": 0,
            "Tên Hàng": "Bia Heineken",
            "Số Lượng": 1,
            "Đơn Giá": 550000,
            "Phương Thức Thanh Toán": "Tiền mặt"
        }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
    
    const filePath = path.join(__dirname, 'test_pos_input.xlsx');
    xlsx.writeFile(wb, filePath);
    console.log('=> Đã tạo file input thành công:', filePath);

    console.log('\n2. Đang đóng gói gửi file qua API /business-event/upload...');
    const formData = new FormData();
    formData.append('location_id', 'LOC_CLEAN_001'); // Sử dụng location test
    formData.append('file', fs.createReadStream(filePath));

    try {
        const response = await axios.post('http://localhost:5000/api/v1/business-event/upload', formData, {
            headers: formData.getHeaders()
        });
        
        console.log('\n======================================================');
        console.log('=> Phản hồi HTTP Status từ BE tới FE:', response.status);
        console.log('=> Output Response từ Controller trả về UI (FE):\n', response.data);
        console.log('======================================================\n');

        // Chờ 2 giây để Worker ngầm chạy xử lý file Excel lưu vào MongoDB
        console.log('3. Chờ 2 giây cho Worker phân tích nền và lưu DB...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('\n4. Truy vấn lại API Danh sách Hóa đơn để xem kết quả Worker lưu...');
        const checkRes = await axios.get('http://localhost:5000/api/v1/business-event?locationId=LOC_CLEAN_001');
        
        console.log('\n======================================================');
        console.log('=> DỮ LIỆU ĐÃ LƯU TRONG MONGODB:\n', JSON.stringify(checkRes.data.data, null, 2));
        console.log('======================================================');

    } catch (err) {
        console.error('Lỗi API:', err.response?.data || err.message);
    }
}

runTest();
