/**
 * gym.seed.js — Seed dữ liệu cơ bản cho phòng gym
 *
 * Chỉ tạo:
 *   - Location (phòng gym)
 *   - Camera (các camera trong phòng gym)
 *   - User (owner, manager, staff)
 *
 * Không tạo bất kỳ dữ liệu phân tích hay kinh doanh nào.
 *
 * Usage:
 *   node src/seeds/gym.seed.js
 *   node src/seeds/gym.seed.js --clean   (xóa dữ liệu cũ trước khi seed)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Location = require('../schemas/location.schema');
const Camera   = require('../schemas/camera.schema');
const User     = require('../schemas/user.schema');
const Asset    = require('../schemas/asset.schema');
const { hashPassword } = require('../middlewares/security.middleware');

const MONGO_URI      = process.env.URI_MONGODB || process.env.MONGO_URI;
const SEED_PASSWORD  = process.env.SEED_TEST_PASSWORD || '123456';
const SHOULD_CLEAN   = process.argv.includes('--clean');

// ── Cấu hình cố định ──────────────────────────────────────────────────────────
const GYM_LOCATION_CODE = 'GYM_SPACELENS_001';

const CAMERAS = [
    {
        camera_code: 'CAM_GYM_ENTRANCE_01',
        camera_name: 'Camera Lối Vào Chính',
        rtsp_url: 'rtsp://admin:admin@192.168.1.101:554/stream1',
        url_image_snapshot: 'https://res.cloudinary.com/dospk2dnl/image/upload/v1765270843/uploads/s8jfq1zamsxmbaopoarm.png',
        zone_note: 'Giám sát khu vực cửa vào, đếm lượt ra/vào'
    },
    {
        camera_code: 'CAM_GYM_CARDIO_01',
        camera_name: 'Camera Khu Cardio',
        rtsp_url: 'rtsp://admin:admin@192.168.1.102:554/stream1',
        url_image_snapshot: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        zone_note: 'Giám sát khu máy chạy bộ, xe đạp'
    },
    {
        camera_code: 'CAM_GYM_WEIGHT_01',
        camera_name: 'Camera Khu Tạ Tự Do',
        rtsp_url: 'rtsp://admin:admin@192.168.1.103:554/stream1',
        url_image_snapshot: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
        zone_note: 'Giám sát khu tạ tự do, barbell'
    },
    {
        camera_code: 'CAM_GYM_MACHINE_01',
        camera_name: 'Camera Khu Máy Tập',
        rtsp_url: 'rtsp://admin:admin@192.168.1.104:554/stream1',
        url_image_snapshot: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
        zone_note: 'Giám sát khu máy tập cơ định'
    },
    {
        camera_code: 'CAM_GYM_LOCKER_01',
        camera_name: 'Camera Khu Tủ Đồ',
        rtsp_url: 'rtsp://admin:admin@192.168.1.105:554/stream1',
        url_image_snapshot: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        zone_note: 'Giám sát khu vực tủ đồ, thay đồ'
    },
    {
        camera_code: 'CAM_GYM_RECEPTION_01',
        camera_name: 'Camera Quầy Lễ Tân',
        rtsp_url: 'rtsp://admin:admin@192.168.1.106:554/stream1',
        url_image_snapshot: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
        zone_note: 'Giám sát quầy lễ tân, check-in hội viên'
    }
];

// ── Danh sách assets phòng gym ────────────────────────────────────────────────
const GYM_ASSETS = [
    // ── Máy Cardio ────────────────────────────────────────────────────────────
    {
        product_id: 'GYM_CARDIO_TM_001',
        category_name: 'Máy Cardio',
        name_product: 'Máy chạy bộ điện Life Fitness T3',
        zone_name: 'Khu Cardio',
        brand: 'Life Fitness',
        price: 45000000,
        unit: 'Máy',
        stock_quantity: 8,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-03-15',
            color: 'Đen - Bạc',
            custom_note: 'Tốc độ tối đa 20km/h, độ dốc 15%, màn hình LCD'
        }
    },
    {
        product_id: 'GYM_CARDIO_EB_001',
        category_name: 'Máy Cardio',
        name_product: 'Xe đạp tập thể dục Technogym Bike',
        zone_name: 'Khu Cardio',
        brand: 'Technogym',
        price: 38000000,
        unit: 'Máy',
        stock_quantity: 6,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-03-20',
            color: 'Trắng - Xám',
            custom_note: 'Kết nối Bluetooth, theo dõi nhịp tim, 24 mức kháng lực'
        }
    },
    {
        product_id: 'GYM_CARDIO_EL_001',
        category_name: 'Máy Cardio',
        name_product: 'Máy tập Elliptical Precor EFX 885',
        zone_name: 'Khu Cardio',
        brand: 'Precor',
        price: 52000000,
        unit: 'Máy',
        stock_quantity: 4,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-04-01',
            color: 'Đen',
            custom_note: 'Chuyển động tự nhiên, 20 mức kháng lực, tay cầm đa năng'
        }
    },
    {
        product_id: 'GYM_CARDIO_RW_001',
        category_name: 'Máy Cardio',
        name_product: 'Máy chèo thuyền Concept2 Model D',
        zone_name: 'Khu Cardio',
        brand: 'Concept2',
        price: 28000000,
        unit: 'Máy',
        stock_quantity: 3,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-02-28',
            color: 'Đen - Cam',
            custom_note: 'Màn hình PM5, kết nối Bluetooth & ANT+, gấp gọn được'
        }
    },
    {
        product_id: 'GYM_CARDIO_SK_001',
        category_name: 'Máy Cardio',
        name_product: 'Máy leo núi StairMaster 8 Series',
        zone_name: 'Khu Cardio',
        brand: 'StairMaster',
        price: 62000000,
        unit: 'Máy',
        stock_quantity: 2,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-04-10',
            color: 'Đen',
            custom_note: 'Bậc thang thực tế, 20 mức tốc độ, màn hình cảm ứng'
        }
    },

    // ── Máy Tập Cơ Định ───────────────────────────────────────────────────────
    {
        product_id: 'GYM_MACHINE_CP_001',
        category_name: 'Máy Tập Cơ Định',
        name_product: 'Máy ép ngực Cable Crossover Technogym',
        zone_name: 'Khu Máy Tập',
        brand: 'Technogym',
        price: 85000000,
        unit: 'Máy',
        stock_quantity: 2,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-03-01',
            color: 'Đen - Vàng',
            custom_note: 'Tải trọng tối đa 150kg mỗi bên, cáp thép bọc nhựa'
        }
    },
    {
        product_id: 'GYM_MACHINE_LP_001',
        category_name: 'Máy Tập Cơ Định',
        name_product: 'Máy Leg Press Life Fitness Signature',
        zone_name: 'Khu Máy Tập',
        brand: 'Life Fitness',
        price: 72000000,
        unit: 'Máy',
        stock_quantity: 2,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-03-10',
            color: 'Đen - Xám',
            custom_note: 'Góc nghiêng 45 độ, tải trọng tối đa 400kg, đệm lưng dày'
        }
    },
    {
        product_id: 'GYM_MACHINE_LD_001',
        category_name: 'Máy Tập Cơ Định',
        name_product: 'Máy kéo xô Lat Pulldown Hammer Strength',
        zone_name: 'Khu Máy Tập',
        brand: 'Hammer Strength',
        price: 55000000,
        unit: 'Máy',
        stock_quantity: 3,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-02-15',
            color: 'Đen',
            custom_note: 'Tải trọng tối đa 200kg, thanh kéo xoay 360 độ'
        }
    },
    {
        product_id: 'GYM_MACHINE_SM_001',
        category_name: 'Máy Tập Cơ Định',
        name_product: 'Máy Smith Machine Body-Solid',
        zone_name: 'Khu Máy Tập',
        brand: 'Body-Solid',
        price: 48000000,
        unit: 'Máy',
        stock_quantity: 2,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-04-05',
            color: 'Đen - Đỏ',
            custom_note: 'Thanh barbell trượt thẳng đứng, khóa an toàn 2 bên'
        }
    },
    {
        product_id: 'GYM_MACHINE_AB_001',
        category_name: 'Máy Tập Cơ Định',
        name_product: 'Máy tập bụng Ab Crunch Technogym',
        zone_name: 'Khu Máy Tập',
        brand: 'Technogym',
        price: 32000000,
        unit: 'Máy',
        stock_quantity: 2,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-03-25',
            color: 'Đen - Xám',
            custom_note: 'Điều chỉnh 15 mức tải trọng, đệm lưng ergonomic'
        }
    },
    {
        product_id: 'GYM_MACHINE_SE_001',
        category_name: 'Máy Tập Cơ Định',
        name_product: 'Máy tập vai Shoulder Press Life Fitness',
        zone_name: 'Khu Máy Tập',
        brand: 'Life Fitness',
        price: 42000000,
        unit: 'Máy',
        stock_quantity: 2,
        status: false,
        asset_attributes: {
            maintenance_date: '2026-05-01',
            color: 'Đen - Bạc',
            custom_note: 'Đang bảo trì — dự kiến hoạt động lại 01/06/2026'
        }
    },

    // ── Tạ Tự Do ──────────────────────────────────────────────────────────────
    {
        product_id: 'GYM_WEIGHT_DB_001',
        category_name: 'Tạ Tự Do',
        name_product: 'Bộ tạ tay Dumbbell Rubber 2-50kg',
        zone_name: 'Khu Tạ Tự Do',
        brand: 'Eleiko',
        price: 95000000,
        unit: 'Bộ',
        stock_quantity: 2,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-01-10',
            color: 'Đen',
            custom_note: 'Bộ 25 cặp từ 2kg đến 50kg, giá để tạ 3 tầng kèm theo'
        }
    },
    {
        product_id: 'GYM_WEIGHT_BB_001',
        category_name: 'Tạ Tự Do',
        name_product: 'Barbell Olympic 20kg Eleiko Sport',
        zone_name: 'Khu Tạ Tự Do',
        brand: 'Eleiko',
        price: 18000000,
        unit: 'Thanh',
        stock_quantity: 6,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-02-01',
            color: 'Bạc - Đen',
            custom_note: 'Chuẩn Olympic, đường kính 28mm, tải trọng tối đa 680kg'
        }
    },
    {
        product_id: 'GYM_WEIGHT_PL_001',
        category_name: 'Tạ Tự Do',
        name_product: 'Đĩa tạ Bumper Plate 5-25kg Rogue',
        zone_name: 'Khu Tạ Tự Do',
        brand: 'Rogue',
        price: 42000000,
        unit: 'Bộ',
        stock_quantity: 4,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-01-20',
            color: 'Đen',
            custom_note: 'Bộ 10 đĩa: 2x5kg, 2x10kg, 2x15kg, 2x20kg, 2x25kg'
        }
    },
    {
        product_id: 'GYM_WEIGHT_KB_001',
        category_name: 'Tạ Tự Do',
        name_product: 'Kettlebell Cast Iron 8-48kg',
        zone_name: 'Khu Tạ Tự Do',
        brand: 'Rogue',
        price: 28000000,
        unit: 'Bộ',
        stock_quantity: 2,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-02-10',
            color: 'Đen',
            custom_note: 'Bộ 8 quả: 8, 12, 16, 20, 24, 28, 32, 48kg'
        }
    },
    {
        product_id: 'GYM_WEIGHT_PR_001',
        category_name: 'Tạ Tự Do',
        name_product: 'Khung Power Rack Rogue R-3',
        zone_name: 'Khu Tạ Tự Do',
        brand: 'Rogue',
        price: 35000000,
        unit: 'Bộ',
        stock_quantity: 3,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-03-05',
            color: 'Đen',
            custom_note: 'Tải trọng tối đa 1000kg, có thanh kéo xô và dip bar'
        }
    },
    {
        product_id: 'GYM_WEIGHT_BN_001',
        category_name: 'Tạ Tự Do',
        name_product: 'Ghế tập tạ Adjustable Bench Technogym',
        zone_name: 'Khu Tạ Tự Do',
        brand: 'Technogym',
        price: 12000000,
        unit: 'Cái',
        stock_quantity: 6,
        status: true,
        asset_attributes: {
            maintenance_date: '2026-02-20',
            color: 'Đen',
            custom_note: 'Điều chỉnh 7 góc độ từ -15 đến 85 độ, tải trọng 300kg'
        }
    },

    // ── Phụ Kiện & Dụng Cụ ───────────────────────────────────────────────────
    {
        product_id: 'GYM_ACC_MAT_001',
        category_name: 'Phụ Kiện',
        name_product: 'Thảm tập yoga & stretching Manduka',
        zone_name: 'Khu Cardio',
        brand: 'Manduka',
        price: 1500000,
        unit: 'Cái',
        stock_quantity: 20,
        status: true,
        asset_attributes: {
            maintenance_date: '',
            color: 'Xanh lá - Tím - Đen',
            custom_note: 'Dày 6mm, chống trượt, kháng khuẩn'
        }
    },
    {
        product_id: 'GYM_ACC_RM_001',
        category_name: 'Phụ Kiện',
        name_product: 'Con lăn foam roller massage TriggerPoint',
        zone_name: 'Khu Cardio',
        brand: 'TriggerPoint',
        price: 850000,
        unit: 'Cái',
        stock_quantity: 15,
        status: true,
        asset_attributes: {
            maintenance_date: '',
            color: 'Đen - Xanh',
            custom_note: 'Bề mặt gai massage sâu, dài 33cm'
        }
    },
    {
        product_id: 'GYM_ACC_RB_001',
        category_name: 'Phụ Kiện',
        name_product: 'Dây kháng lực Resistance Band bộ 5 dây',
        zone_name: 'Khu Máy Tập',
        brand: 'Rogue',
        price: 650000,
        unit: 'Bộ',
        stock_quantity: 10,
        status: true,
        asset_attributes: {
            maintenance_date: '',
            color: 'Nhiều màu',
            custom_note: '5 mức kháng lực: 5, 10, 15, 20, 25kg'
        }
    },
    {
        product_id: 'GYM_ACC_JR_001',
        category_name: 'Phụ Kiện',
        name_product: 'Dây nhảy Speed Rope Crossfit',
        zone_name: 'Khu Cardio',
        brand: 'Rx Smart Gear',
        price: 450000,
        unit: 'Cái',
        stock_quantity: 12,
        status: true,
        asset_attributes: {
            maintenance_date: '',
            color: 'Đen - Đỏ',
            custom_note: 'Dây thép bọc nhựa, tay cầm bearing, điều chỉnh độ dài'
        }
    }
];

// ── Danh sách users ───────────────────────────────────────────────────────────
// Cấu trúc: { account, email, role, displayName, phone }
const GYM_USERS = [
    // Chủ phòng gym — ADMIN_SUPER, không gắn location
    {
        account: 'owner_spacelens_gym',
        email: 'owner@spacelens-gym.vn',
        role: 'ADMIN_SUPER',
        displayName: 'Nguyễn Minh Khoa',
        phone: '0901234567',
        note: 'Chủ phòng gym SpaceLens'
    },
    // Admin quản lý toàn bộ hệ thống phòng gym
    {
        account: 'admin_spacelens_gym',
        email: 'admin@spacelens-gym.vn',
        role: 'ADMIN',
        displayName: 'Trần Thị Lan Anh',
        phone: '0912345678',
        note: 'Admin hệ thống'
    },
    // Manager quản lý phòng gym
    {
        account: 'manager_gym_001',
        email: 'manager@spacelens-gym.vn',
        role: 'MANAGER',
        displayName: 'Lê Hoàng Phúc',
        phone: '0923456789',
        note: 'Quản lý phòng gym ca sáng & chiều'
    },
    // Staff — nhân viên lễ tân
    {
        account: 'staff_reception_01',
        email: 'reception1@spacelens-gym.vn',
        role: 'USER',
        displayName: 'Phạm Thị Thu Hà',
        phone: '0934567890',
        note: 'Nhân viên lễ tân ca sáng'
    },
    {
        account: 'staff_reception_02',
        email: 'reception2@spacelens-gym.vn',
        role: 'USER',
        displayName: 'Võ Văn Bình',
        phone: '0945678901',
        note: 'Nhân viên lễ tân ca chiều'
    },
    // PT (Personal Trainer)
    {
        account: 'pt_nguyen_duc_anh',
        email: 'pt.ducanh@spacelens-gym.vn',
        role: 'USER',
        displayName: 'Nguyễn Đức Anh',
        phone: '0956789012',
        note: 'HLV cá nhân — chuyên cardio & giảm cân'
    },
    {
        account: 'pt_tran_bao_chau',
        email: 'pt.baochau@spacelens-gym.vn',
        role: 'USER',
        displayName: 'Trần Bảo Châu',
        phone: '0967890123',
        note: 'HLV cá nhân — chuyên tăng cơ & powerlifting'
    }
];

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
    if (!MONGO_URI) {
        throw new Error('Missing MongoDB URI. Set URI_MONGODB or MONGO_URI in .env');
    }

    await mongoose.connect(MONGO_URI, { dbName: 'spacelens' });
    console.log('[gym-seed] Connected MongoDB');

    // ── Clean nếu có flag --clean ─────────────────────────────────────────────
    if (SHOULD_CLEAN) {
        const loc = await Location.findOne({ location_code: GYM_LOCATION_CODE });
        if (loc) {
            const locationId = loc.location_code;
            await Promise.all([
                Camera.deleteMany({ location_id: locationId }),
                User.deleteMany({
                    account: { $in: GYM_USERS.map(u => u.account) }
                }),
                Location.deleteOne({ location_code: GYM_LOCATION_CODE })
            ]);
            console.log(`[gym-seed] Cleaned existing data for ${GYM_LOCATION_CODE}`);
        }
    }

    // ── 1. Location ───────────────────────────────────────────────────────────
    let location = await Location.findOne({ location_code: GYM_LOCATION_CODE });
    if (!location) {
        location = await Location.create({
            location_code: GYM_LOCATION_CODE,
            name: 'SpaceLens Fitness Center',
            address: '123 Nguyễn Văn Linh, Phường Tân Phong, Quận 7, TP.HCM',
            type_model: 'GYM',
            manager_info: {
                name: 'Lê Hoàng Phúc',
                phone: '0923456789',
                email: 'manager@spacelens-gym.vn'
            },
            business_hours: {
                open: '05:30',
                close: '23:00',
                timezone: 'Asia/Ho_Chi_Minh'
            }
        });
        console.log(`[gym-seed] Created location: ${location.name} (${location.location_code})`);
    } else {
        console.log(`[gym-seed] Location already exists: ${location.location_code}`);
    }

    const locationId = location.location_code;

    // ── 2. Cameras ────────────────────────────────────────────────────────────
    const now = new Date();
    const cameraResults = [];

    for (const cam of CAMERAS) {
        const existing = await Camera.findOne({ camera_code: cam.camera_code });
        if (existing) {
            console.log(`[gym-seed] Camera already exists: ${cam.camera_code}`);
            cameraResults.push(existing);
            continue;
        }

        const created = await Camera.create({
            location_id: locationId,
            camera_name: cam.camera_name,
            camera_code: cam.camera_code,
            rtsp_url: cam.rtsp_url,
            url_image_snapshot: cam.url_image_snapshot,
            status: 'active',
            installation_date: now,
            camera_spec: {
                max_resolution: { width: 1920, height: 1080 },
                current_resolution: { width: 1280, height: 720 }
            },
            camera_state: {
                last_processed_time: now,
                last_stop_time: null
            }
        });

        cameraResults.push(created);
        console.log(`[gym-seed] Created camera: ${cam.camera_code} — ${cam.camera_name}`);
    }

    // ── 3. Assets ─────────────────────────────────────────────────────────────
    // Xóa assets cũ của location này nếu --clean
    if (SHOULD_CLEAN) {
        await Asset.deleteMany({ location_id: locationId });
        console.log(`[gym-seed] Cleaned assets for ${locationId}`);
    }

    const existingAssetIds = new Set(
        (await Asset.find({ location_id: locationId }).select('product_id').lean())
            .map(a => a.product_id)
    );

    const assetsToInsert = GYM_ASSETS
        .filter(a => !existingAssetIds.has(a.product_id))
        .map(a => ({ ...a, location_id: locationId }));

    let assetResults = [];
    if (assetsToInsert.length > 0) {
        assetResults = await Asset.insertMany(assetsToInsert);
        console.log(`[gym-seed] Created ${assetResults.length} assets`);
    } else {
        console.log('[gym-seed] Assets already exist, skipping');
        assetResults = await Asset.find({ location_id: locationId }).lean();
    }

    // ── 4. Users ──────────────────────────────────────────────────────────────
    const hashedPassword = await hashPassword(SEED_PASSWORD);
    const userResults = [];

    for (const u of GYM_USERS) {
        const existing = await User.findOne({ account: u.account });
        if (existing) {
            console.log(`[gym-seed] User already exists: ${u.account}`);
            userResults.push(existing);
            continue;
        }

        const userDoc = {
            account: u.account,
            password: hashedPassword,
            email: u.email,
            role: u.role
        };

        // ADMIN_SUPER không cần location_id
        if (u.role !== 'ADMIN_SUPER') {
            userDoc.location_id = locationId;
        }

        const created = await User.create(userDoc);
        userResults.push(created);
        console.log(`[gym-seed] Created user: ${u.account} (${u.role}) — ${u.displayName}`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n[gym-seed] ═══════════════════════════════════════════');
    console.log('[gym-seed] SEED HOÀN TẤT');
    console.log('[gym-seed] ═══════════════════════════════════════════');
    console.log(`[gym-seed] Location  : ${location.name}`);
    console.log(`[gym-seed] Code      : ${locationId}`);
    console.log(`[gym-seed] Địa chỉ  : ${location.address}`);
    console.log(`[gym-seed] Giờ mở   : ${location.business_hours.open} – ${location.business_hours.close}`);
    console.log(`[gym-seed] Manager  : ${location.manager_info.name} (${location.manager_info.phone})`);
    console.log(`[gym-seed] Cameras  : ${cameraResults.length}`);
    cameraResults.forEach(c => {
        const note = CAMERAS.find(x => x.camera_code === c.camera_code)?.zone_note || '';
        console.log(`[gym-seed]   • ${c.camera_code} — ${c.camera_name}`);
        console.log(`[gym-seed]     ${note}`);
    });
    // Group assets by category
    const assetByCategory = {};
    assetResults.forEach(a => {
        const cat = a.category_name;
        if (!assetByCategory[cat]) assetByCategory[cat] = [];
        assetByCategory[cat].push(a);
    });
    console.log(`[gym-seed] Assets   : ${assetResults.length}`);
    Object.entries(assetByCategory).forEach(([cat, items]) => {
        console.log(`[gym-seed]   [${cat}] — ${items.length} sản phẩm`);
        items.forEach(a => {
            const statusLabel = a.status ? 'active' : 'inactive';
            console.log(`[gym-seed]     • ${a.product_id.padEnd(25)} ${a.name_product} (${statusLabel})`);
        });
    });
    console.log(`[gym-seed] Users    : ${userResults.length}`);
    GYM_USERS.forEach(u => {
        console.log(`[gym-seed]   • ${u.account.padEnd(30)} ${u.role.padEnd(12)} ${u.displayName}`);
    });
    console.log(`[gym-seed] Password : ${SEED_PASSWORD} (tất cả accounts)`);
    console.log('[gym-seed] ═══════════════════════════════════════════\n');
}

seed()
    .then(() => mongoose.disconnect())
    .catch(err => {
        console.error('[gym-seed] ERROR:', err.message);
        mongoose.disconnect();
        process.exit(1);
    });
