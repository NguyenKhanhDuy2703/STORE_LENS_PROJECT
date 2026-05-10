const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const data = [
    {
        "Mã Hóa Đơn": "HD0001",
        "Ngày Giao Dịch": "2026-05-10T08:15:00Z",
        "Tổng Tiền": 150000,
        "Giảm Giá": 10000,
        "Tên Hàng": "Cà phê sữa đá",
        "Số Lượng": 2,
        "Đơn Giá": 35000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0001",
        "Ngày Giao Dịch": "2026-05-10T08:15:00Z",
        "Tổng Tiền": 150000,
        "Giảm Giá": 10000,
        "Tên Hàng": "Bánh Croissant",
        "Số Lượng": 2,
        "Đơn Giá": 40000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0002",
        "Ngày Giao Dịch": "2026-05-10T09:30:00Z",
        "Tổng Tiền": 55000,
        "Giảm Giá": 0,
        "Tên Hàng": "Trà đào cam sả",
        "Số Lượng": 1,
        "Đơn Giá": 55000,
        "Phương Thức Thanh Toán": "Tiền mặt"
    },
    {
        "Mã Hóa Đơn": "HD0003",
        "Ngày Giao Dịch": "2026-05-10T12:05:00Z",
        "Tổng Tiền": 210000,
        "Giảm Giá": 0,
        "Tên Hàng": "Combo Cơm trưa",
        "Số Lượng": 3,
        "Đơn Giá": 70000,
        "Phương Thức Thanh Toán": "Thẻ tín dụng"
    }
];

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(data);

// Chỉnh lại độ rộng cột cho đẹp
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
console.log('Đã tạo thành công file:', filePath);
