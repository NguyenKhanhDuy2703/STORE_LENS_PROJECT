const xlsx = require('xlsx');
const path = require('path');

// Ngày hôm nay theo VN timezone (UTC+7) — đảm bảo khớp filter của BE
const now = new Date();
const vnOffset = 7 * 60 * 60 * 1000;
const vnNow = new Date(now.getTime() + vnOffset);
const dateStr = vnNow.toISOString().slice(0, 10); // "2026-05-11"

// Tạo ISO timestamp cho ngày hôm nay với giờ chỉ định (giờ VN)
const makeDate = (hh, mm) => `${dateStr}T${String(Number(hh) - 7).padStart(2,'0')}:${mm}:00Z`;

const data = [
    {
        "Mã Hóa Đơn": "HD0001",
        "Ngày Giao Dịch": makeDate("08", "15"),
        "Tổng Tiền": 150000,
        "Giảm Giá": 10000,
        "Tên Hàng": "Cà phê sữa đá",
        "Số Lượng": 2,
        "Đơn Giá": 35000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0001",
        "Ngày Giao Dịch": makeDate("08", "15"),
        "Tổng Tiền": 150000,
        "Giảm Giá": 10000,
        "Tên Hàng": "Bánh Croissant",
        "Số Lượng": 2,
        "Đơn Giá": 40000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0002",
        "Ngày Giao Dịch": makeDate("09", "30"),
        "Tổng Tiền": 55000,
        "Giảm Giá": 0,
        "Tên Hàng": "Trà đào cam sả",
        "Số Lượng": 1,
        "Đơn Giá": 55000,
        "Phương Thức Thanh Toán": "Tiền mặt"
    },
    {
        "Mã Hóa Đơn": "HD0003",
        "Ngày Giao Dịch": makeDate("12", "05"),
        "Tổng Tiền": 210000,
        "Giảm Giá": 0,
        "Tên Hàng": "Combo Cơm trưa",
        "Số Lượng": 3,
        "Đơn Giá": 70000,
        "Phương Thức Thanh Toán": "Thẻ tín dụng"
    },
    {
        "Mã Hóa Đơn": "HD0004",
        "Ngày Giao Dịch": makeDate("14", "20"),
        "Tổng Tiền": 320000,
        "Giảm Giá": 20000,
        "Tên Hàng": "Nước ép trái cây",
        "Số Lượng": 4,
        "Đơn Giá": 45000,
        "Phương Thức Thanh Toán": "Chuyển khoản"
    },
    {
        "Mã Hóa Đơn": "HD0005",
        "Ngày Giao Dịch": makeDate("16", "00"),
        "Tổng Tiền": 85000,
        "Giảm Giá": 0,
        "Tên Hàng": "Bánh tiramisu",
        "Số Lượng": 1,
        "Đơn Giá": 85000,
        "Phương Thức Thanh Toán": "Tiền mặt"
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
console.log(`Tạo dữ liệu ngày: ${dateStr} (VN) — Tổng ${data.length} dòng`);
console.log('Đã tạo thành công file:', filePath);
