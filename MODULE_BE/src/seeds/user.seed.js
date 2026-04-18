require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../schemas/user.schema'); 
const { hashPassword } = require('../middlewares/security.middleware');
const config = require('../config');

const seedUsers = async () => {
    try {
        // 1. Kết nối Database từ config hệ thống
        const { mongoURI } = config.getConfig().database;
        await mongoose.connect(mongoURI);
        console.log('🚀 Đã kết nối MongoDB thành công!');

        // 2. Dọn dẹp dữ liệu cũ
        await User.deleteMany({});
        console.log('🧹 Đã dọn dẹp collection User.');

        // 3. Hash mật khẩu '123456'
        const hashedPass = await hashPassword('123456');

        // 4. Danh sách User đồng bộ với bảng Locations trong Compass
        const dummyUsers = [
            {
                account: 'superadmin',
                password: hashedPass,
                email: 'superadmin@spacelens.vn',
                role: 'ADMIN_SUPER'
                // ADMIN_SUPER không cần location_id vì quản lý toàn sàn
            },
            {
                account: 'admin_test',
                password: hashedPass,
                email: 'admin.test@spacelens.vn',
                role: 'ADMIN',
                // Đồng bộ với Store "Demo Store 890" trong ảnh Compass của bạn
                location_id: 'LOC_TEST_001' 
            },
            {
                account: 'manager_dat', // Tài khoản quản lý của Trương Thành Đạt
                password: hashedPass,
                email: 'dat.truong@spacelens.vn',
                role: 'MANAGER',
                fullname: 'Trương Thành Đạt',
                // Đồng bộ với "Cửa hàng Spacelens Flagship" (Mã LOC001)
                location_id: 'LOC001' 
            },
            {
                account: 'staff_hcm',
                password: hashedPass,
                email: 'staff.hcm@spacelens.vn',
                role: 'USER',
                location_id: 'LOC001'
            }
        ];

        // 5. Đẩy dữ liệu vào DB
        await User.insertMany(dummyUsers);
        
        console.log('------------------------------------------');
        console.log('✅ SEED USER ĐÃ ĐỒNG BỘ VỚI LOCATIONS!');
        console.log('Mật khẩu chung: 123456');
        console.log('Danh sách truy cập:');
        dummyUsers.forEach(u => {
            const locInfo = u.location_id ? ` -> Cửa hàng: ${u.location_id}` : ' -> Toàn hệ thống';
            console.log(` - [${u.role}]: ${u.account}${locInfo}`);
        });
        console.log('------------------------------------------');

    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

seedUsers();