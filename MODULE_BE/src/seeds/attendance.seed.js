const mongoose = require('mongoose');

const moment = require('moment-timezone');

const Customer = require('../schemas/customer.schema');

const config = require('../config');



const TIMEZONE = 'Asia/Ho_Chi_Minh';

const LOCATION_ID = "LOC_TEST_001";

const YEAR = 2026;



const seedFullData = async () => {

    try {

        const dbUri = config.database.mongoURI;

        if (!dbUri) {

            console.error("❌ Lỗi: Không tìm thấy URI_MONGODB trong config");

            return;

        }



        console.log("🚀 Đang kết nối Database để nạp dữ liệu từ THÁNG 1 đến THÁNG 4...");

        await mongoose.connect(dbUri);

       

        // Xóa dữ liệu cũ để làm mới

        await Customer.deleteMany({ locationId: LOCATION_ID });



        const fullNames = [

            "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Long", "Phạm Minh Tuấn", "Vũ Thị Hà",

            "Đặng Đức Hùng", "Bùi Thị Thanh", "Ngô Gia Bảo", "Trịnh Công Sơn", "Đỗ Thị Quyên",

            "Lý Minh Triết", "Hoàng Anh Thư", "Võ Văn Kiệt", "Mai Phương Thúy", "Cao Văn Tiến",

            "Đinh Tiến Dũng", "Quách Ngọc Ngoan", "Trương Mỹ Nhân", "Hồ Quang Hiếu", "Phan Mạnh Quỳnh",

            "Dương Quá", "Tiểu Long Nữ", "Lệnh Hồ Xung", "Nhậm Doanh Doanh", "Quách Tĩnh",

            "Hoàng Dung", "Trần Huyền Trang", "Tôn Ngộ Không", "Trương Vô Kỵ", "Triệu Mẫn",

            "Chu Chỉ Nhược", "Tiêu Phong", "Đoàn Dự", "Hư Trúc", "Vương Ngữ Yên",

            "Nguyễn Du", "Hồ Xuân Hương", "Bà Huyện Thanh Quan", "Trần Hưng Đạo", "Lý Thường Kiệt",

            "Nguyễn Huệ", "Lê Lợi", "Ngô Quyền", "Đinh Bộ Lĩnh", "Phan Bội Châu",

            "Phan Chu Trinh", "Võ Nguyên Giáp", "Phạm Văn Đồng", "Tôn Đức Thắng", "Lê Hồng Phong"

        ];



        const customers = [];



        for (let i = 0; i < fullNames.length; i++) {

            const history = [];

            const type = i % 4; // Chia nhóm: 0-VIP, 1-Nghỉ tập, 2-Lười, 3-Bình thường



            // Lặp qua các tháng 1, 2, 3, 4

            [1, 2, 3, 4].forEach(month => {

                for (let week = 1; week <= 4; week++) {

                    let sessions = 0;

                   

                    if (type === 0) {

                        sessions = Math.floor(Math.random() * 2) + 4; // VIP tập 4-5 buổi suốt 4 tháng

                    } else if (type === 1) {

                        // Khách bỏ tập: Tháng 1,2,3 tập đều, tháng 4 nghỉ hẳn (số buổi = 0)

                        sessions = (month < 4) ? Math.floor(Math.random() * 3) + 1 : 0;

                    } else if (type === 2) {

                        sessions = Math.floor(Math.random() * 2); // Khách lười 0-1 buổi

                    } else {

                        sessions = Math.floor(Math.random() * 2) + 1; // Bình thường 1-2 buổi

                    }



                    for (let s = 0; s < sessions; s++) {

                        const day = (week - 1) * 7 + Math.floor(Math.random() * 7) + 1;

                        const date = moment.tz(`${YEAR}-${month}-${day}`, "YYYY-MM-DD", TIMEZONE).hours(18);

                       

                        if (date.isValid()) {

                            history.push({

                                date: date.toDate(),

                                check_in: date.toDate(),

                                check_out: date.clone().add(1.5, 'hours').toDate(),

                                locationId: LOCATION_ID

                            });

                        }

                    }

                }

            });



            customers.push({

                locationId: LOCATION_ID,

                code: `KH${(i + 1).toString().padStart(3, '0')}`,

                name: fullNames[i],

                phone: `09${(70000000 + i).toString()}`,

                birthday: new Date('1995-01-01'),

                joinDate: new Date('2025-12-01'),

                status: (type === 1) ? 'INACTIVE' : 'ACTIVE',

                history: history,

                totalSessions: history.length,

                lastVisit: history.length > 0 ? history[history.length - 1].date : null,

                note: type === 1 ? "Đã nghỉ tập từ tháng 4" : type === 0 ? "Khách VIP bền bỉ" : ""

            });

        }



        await Customer.insertMany(customers);

        console.log(`✅ HOÀN TẤT: Đã seed 50 khách hàng với dữ liệu THÁNG 1, 2, 3, 4`);

       

        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error("❌ LỖI SEED:", error);

        process.exit(1);

    }

};



seedFullData();