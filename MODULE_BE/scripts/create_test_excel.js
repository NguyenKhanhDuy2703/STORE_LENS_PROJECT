const xlsx = require('xlsx');
const path = require('path');
const moment = require('moment-timezone');

// Tạo dữ liệu cho 7 ngày gần đây (để dễ test với các date range khác nhau)
const today = moment().tz('Asia/Ho_Chi_Minh');

// Helper: Tạo ISO timestamp cho một ngày cụ thể
const makeDate = (daysAgo, hh, mm) => {
    return today.clone().subtract(daysAgo, 'days').hour(hh).minute(mm).second(0).toISOString();
};

const data = [
    // Hôm nay (0 ngày trước)
    {
        "Mã Hóa Đơn": "HD0001",
        "Ngày Giao Dịch": makeDate(0, 8, 15),
        "Tổng Tiền": 150000,
        "Giảm Giá": 10000,
        "Tên Hàng": "Cà phê sữa đá",
        "Số Lượng": 2,
        "Đơn Giá": 35000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0001",
        "Ngày Giao Dịch": makeDate(0, 8, 15),
        "Tổng Tiền": 150000,
        "Giảm Giá": 10000,
        "Tên Hàng": "Bánh Croissant",
        "Số Lượng": 2,
        "Đơn Giá": 40000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0002",
        "Ngày Giao Dịch": makeDate(0, 14, 30),
        "Tổng Tiền": 55000,
        "Giảm Giá": 0,
        "Tên Hàng": "Trà đào cam sả",
        "Số Lượng": 1,
        "Đơn Giá": 55000,
        "Phương Thức Thanh Toán": "Tiền mặt"
    },
    
    // Hôm qua (1 ngày trước)
    {
        "Mã Hóa Đơn": "HD0003",
        "Ngày Giao Dịch": makeDate(1, 9, 0),
        "Tổng Tiền": 210000,
        "Giảm Giá": 0,
        "Tên Hàng": "Combo Cơm trưa",
        "Số Lượng": 3,
        "Đơn Giá": 70000,
        "Phương Thức Thanh Toán": "Thẻ tín dụng"
    },
    {
        "Mã Hóa Đơn": "HD0004",
        "Ngày Giao Dịch": makeDate(1, 15, 20),
        "Tổng Tiền": 320000,
        "Giảm Giá": 20000,
        "Tên Hàng": "Nước ép trái cây",
        "Số Lượng": 4,
        "Đơn Giá": 45000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0004",
        "Ngày Giao Dịch": makeDate(1, 15, 20),
        "Tổng Tiền": 320000,
        "Giảm Giá": 20000,
        "Tên Hàng": "Bánh mì sandwich",
        "Số Lượng": 2,
        "Đơn Giá": 50000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    
    // 2 ngày trước
    {
        "Mã Hóa Đơn": "HD0005",
        "Ngày Giao Dịch": makeDate(2, 10, 0),
        "Tổng Tiền": 85000,
        "Giảm Giá": 0,
        "Tên Hàng": "Bánh tiramisu",
        "Số Lượng": 1,
        "Đơn Giá": 85000,
        "Phương Thức Thanh Toán": "Tiền mặt"
    },
    {
        "Mã Hóa Đơn": "HD0006",
        "Ngày Giao Dịch": makeDate(2, 16, 45),
        "Tổng Tiền": 120000,
        "Giảm Giá": 10000,
        "Tên Hàng": "Sinh tố bơ",
        "Số Lượng": 2,
        "Đơn Giá": 60000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    
    // 3 ngày trước
    {
        "Mã Hóa Đơn": "HD0007",
        "Ngày Giao Dịch": makeDate(3, 11, 30),
        "Tổng Tiền": 95000,
        "Giảm Giá": 0,
        "Tên Hàng": "Phở bò",
        "Số Lượng": 1,
        "Đơn Giá": 95000,
        "Phương Thức Thanh Toán": "Tiền mặt"
    },
    
    // 4 ngày trước
    {
        "Mã Hóa Đơn": "HD0008",
        "Ngày Giao Dịch": makeDate(4, 13, 15),
        "Tổng Tiền": 180000,
        "Giảm Giá": 15000,
        "Tên Hàng": "Lẩu thái",
        "Số Lượng": 2,
        "Đơn Giá": 90000,
        "Phương Thức Thanh Toán": "Thẻ tín dụng"
    },
    
    // 5 ngày trước
    {
        "Mã Hóa Đơn": "HD0009",
        "Ngày Giao Dịch": makeDate(5, 12, 0),
        "Tổng Tiền": 75000,
        "Giảm Giá": 0,
        "Tên Hàng": "Bún chả",
        "Số Lượng": 1,
        "Đơn Giá": 75000,
        "Phương Thức Thanh Toán": "Tiền mặt"
    },
    
    // 6 ngày trước
    {
        "Mã Hóa Đơn": "HD0010",
        "Ngày Giao Dịch": makeDate(6, 14, 30),
        "Tổng Tiền": 250000,
        "Giảm Giá": 25000,
        "Tên Hàng": "Combo gia đình",
        "Số Lượng": 1,
        "Đơn Giá": 250000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    }
];

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);

ws['!cols'] = [
    { wch: 15 }, // Mã Hóa Đơn
    { wch: 25 }, // Ngày Giao Dịch
    { wch: 12 }, // Tổng Tiền
    { wch: 10 }, // Giảm Giá
    { wch: 20 }, // Tên Hàng
    { wch: 10 }, // Số Lượng
    { wch: 12 }, // Đơn Giá
    { wch: 25 }  // Phương Thức Thanh Toán
];

xlsx.utils.book_append_sheet(wb, ws, "HoaDon_POS");

const filePath = path.join('d:\\NCKH_2', 'POS_Mau_Test.xlsx');
xlsx.writeFile(wb, filePath);

console.log('✅ Đã tạo thành công file:', filePath);
console.log(`📊 Tổng số dòng: ${data.length}`);
console.log(`📅 Khoảng thời gian: ${today.clone().subtract(6, 'days').format('DD/MM/YYYY')} → ${today.format('DD/MM/YYYY')}`);
console.log('\n📋 Chi tiết hóa đơn:');
console.log('  - Hôm nay:     HD0001, HD0002 (2 hóa đơn)');
console.log('  - Hôm qua:     HD0003, HD0004 (2 hóa đơn)');
console.log('  - 2 ngày trước: HD0005, HD0006 (2 hóa đơn)');
console.log('  - 3 ngày trước: HD0007 (1 hóa đơn)');
console.log('  - 4 ngày trước: HD0008 (1 hóa đơn)');
console.log('  - 5 ngày trước: HD0009 (1 hóa đơn)');
console.log('  - 6 ngày trước: HD0010 (1 hóa đơn)');
console.log('\n💡 Bây giờ bạn có thể upload file này qua website để test!');
