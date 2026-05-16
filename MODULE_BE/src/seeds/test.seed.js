require('dotenv').config();
const mongoose = require('mongoose');

const Location = require('../schemas/location.schema');
const Camera = require('../schemas/camera.schema');
const Zone = require('../schemas/zone.schema');
const Asset = require('../schemas/asset.schema');
const Customer = require('../schemas/customer.schema');
const User = require('../schemas/user.schema');
// Analytics schemas to clean
const LocationStats = require('../schemas/locationStats.schema');
const ZoneStats = require('../schemas/zoneStats.schema');
const Heatmap = require('../schemas/heatmap.schema');
const FlowPatterns = require('../schemas/flowPatterns.schema');
const CustomerCareRule = require('../schemas/customerCareRule.schema');
const Notification = require('../schemas/notification.schema');
const Session = require('../schemas/session.schema');
const BusinessEvent = require('../schemas/businessEvent.schema');
const InteractionLog = require('../schemas/interactionLog.schema');
const { hashPassword } = require('../middlewares/security.middleware');
const { getCurrnetDateVN } = require('../utils/date.util');

// ── Configuration ─────────────────────────────────────────────────────────────
const MONGO_URI = process.env.URI_MONGODB || process.env.MONGO_URI;
const LOCATION_CODE = 'GYM_TEST_001';  // ⭐ Changed to avoid conflict with fake.seed.js
const SEED_PASSWORD = process.env.SEED_TEST_PASSWORD || '123456';
const SHOULD_CLEAN = true;  // ⭐ Always clean data for test environment
const KEEP_LOCATION_CAMERA = process.argv.includes('--keep-location-camera');

// ── Camera Configuration ──────────────────────────────────────────────────────
const CAMERA_CODES = {
    entrance: 'CAM_TEST_ENTRANCE_01',
    cardio: 'CAM_TEST_CARDIO_01'
};

const CAMERAS_CONFIG = [
    {
        camera_code: CAMERA_CODES.entrance,
        camera_name: 'Camera Lối Vào Chính',
        rtsp_url: 'D:\\NCKH_2\\MODULE_AI\\storage\\videos\\video_3.mp4',
        zone_note: 'Giám sát khu vực cửa vào, đếm lượt ra/vào'
    },
    {
        camera_code: CAMERA_CODES.cardio,
        camera_name: 'Camera Khu Cardio',
        rtsp_url: 'D:\\NCKH_2\\MODULE_AI\\storage\\videos\\video_4.mp4',
        zone_note: 'Giám sát khu máy chạy bộ, xe đạp'
    }
];

// ── Zone IDs ──────────────────────────────────────────────────────────────────
const ZONE_IDS = {
    entrance: 'ZONE_TEST_ENTRANCE',
    cardio: 'ZONE_TEST_CARDIO'
};

// ── Helper Functions ──────────────────────────────────────────────────────────
function cleanupLocationData(locationId, options = {}) {
    const { keepLocationCamera = false } = options;
    
    // Delete configuration data
    const deleteTasks = [
        Asset.deleteMany({ location_id: locationId }),
        Customer.deleteMany({ locationId: locationId }),
        Zone.deleteMany({ location_id: locationId }),
        User.deleteMany({ location_id: locationId })
    ];
    
    // Delete ALL analytics data (heatmap, stats, notifications, etc.)
    const analyticsDeleteTasks = [
        LocationStats.deleteMany({ location_id: locationId }),
        ZoneStats.deleteMany({ location_id: locationId }),
        Heatmap.deleteMany({ location_id: locationId }),
        FlowPatterns.deleteMany({ location_id: locationId }),
        CustomerCareRule.deleteMany({ location_id: locationId }),
        Notification.deleteMany({ location_id: locationId }),
        Session.deleteMany({ location_id: locationId }),
        BusinessEvent.deleteMany({ location_id: locationId }),
        InteractionLog.deleteMany({ location_id: locationId })
    ];
    
    if (!keepLocationCamera) {
        deleteTasks.push(
            Camera.deleteMany({ location_id: locationId }),
            Location.deleteOne({ location_code: locationId })
        );
    }
    
    return Promise.all([...deleteTasks, ...analyticsDeleteTasks]);
}

// ── Main Seed Function ────────────────────────────────────────────────────────
async function seed() {
    if (!MONGO_URI) {
        throw new Error('Missing MongoDB URI. Set URI_MONGODB or MONGO_URI in .env');
    }

    await mongoose.connect(MONGO_URI, { dbName: 'spacelens' });
    console.log('[test-seed] Connected to MongoDB');
    console.log('[test-seed] ═══════════════════════════════════════════════════════');
    console.log('[test-seed] 🧪 TEST SEED MODE - Auto-cleaning enabled');
    console.log('[test-seed] ═══════════════════════════════════════════════════════');

    const locationId = LOCATION_CODE;

    // ── Clean existing data if requested ──────────────────────────────────────
    if (SHOULD_CLEAN) {
        console.log(`[test-seed] 🧹 Cleaning existing test data for ${locationId}...`);
        console.log(`[test-seed]    • Configuration data (Location, Camera, Zone, User, Customer, Asset)`);
        console.log(`[test-seed]    • Analytics data (Stats, Heatmap, FlowPatterns, Notifications, Sessions, Events)`);
        await cleanupLocationData(locationId, { keepLocationCamera: KEEP_LOCATION_CAMERA });
        console.log(`[test-seed] ✓ All data cleaned for ${locationId}`);
        if (KEEP_LOCATION_CAMERA) {
            console.log('[test-seed] Keep mode: preserved location/camera data');
        }
    }

    // ── 1. Location ───────────────────────────────────────────────────────────
    const location = await Location.findOneAndUpdate(
        { location_code: LOCATION_CODE },
        {
            location_code: LOCATION_CODE,
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
        },
        { upsert: true, new: true }
    );
    console.log(`[test-seed] ✓ Location: ${location.name}`);

    // ── 2. Cameras ────────────────────────────────────────────────────────────
    const cameras = KEEP_LOCATION_CAMERA
        ? await Camera.find({ 
            location_id: locationId, 
            camera_code: { $in: Object.values(CAMERA_CODES) } 
          }).lean()
        : await Camera.insertMany(
            CAMERAS_CONFIG.map(cam => ({
                location_id: locationId,
                camera_name: cam.camera_name,
                camera_code: cam.camera_code,
                rtsp_url: cam.rtsp_url,
                url_image_snapshot: 'https://res.cloudinary.com/dospk2dnl/image/upload/v1778688223/spacelens/zones/zone_1778688215793.jpg',
                status: 'active',
                installation_date: getCurrnetDateVN(),
                camera_spec: {
                    max_resolution: { width: 1920, height: 1080 },
                    current_resolution: { width: 1280, height: 720 }
                },
                camera_state: {
                    last_processed_time: getCurrnetDateVN(),
                    last_stop_time: null
                }
            }))
        );

    const cameraMap = cameras.reduce((map, cam) => {
        map[cam.camera_code] = cam;
        return map;
    }, {});

    console.log(`[test-seed] ✓ Cameras: ${cameras.length} cameras configured`);

    // ── 3. Zones ──────────────────────────────────────────────────────────────
    const zones = await Zone.insertMany([
        {
            location_id: locationId,
            camera_id: CAMERA_CODES.entrance,
            zone_name: 'Lối vào chính',
            zone_id: ZONE_IDS.entrance,
            category_name: 'Entrance',
            polygon_coordinates: [
                [0.02, 0.04], [0.44, 0.04], [0.44, 0.52], [0.02, 0.52]
            ]
        },
        {
            location_id: locationId,
            camera_id: CAMERA_CODES.cardio,
            zone_name: 'Khu vực Cardio',
            zone_id: ZONE_IDS.cardio,
            category_name: 'Máy Cardio',
            polygon_coordinates: [
                [0.609756, 0.320346], [0.967073, 0.430736],
                [0.841463, 0.997835], [0.181707, 0.991342]
            ]
        }
    ]);
    console.log(`[test-seed] ✓ Zones: ${zones.length} zones created`);

    // ── 4. Assets ─────────────────────────────────────────────────────────────
    const assets = await Asset.insertMany([
        // ── GÓI TẬP (Membership Packages) ──────────────────────────────────────
        {
            location_id: locationId,
            product_id: 'TEST_PKG_001',
            category_name: 'Membership Package',
            name_product: 'Gói tập 1 tháng (Cơ bản)',
            zone_name: 'Quầy tiếp tân',
            brand: 'SpaceLens Fitness',
            price: 350000,
            unit: 'gói',
            stock_quantity: 999,
            status: true,
            asset_attributes: { custom_note: 'Tập không giới hạn giờ, không PT, không phòng Yoga' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_PKG_002',
            category_name: 'Membership Package',
            name_product: 'Gói tập 3 tháng (Tiêu chuẩn)',
            zone_name: 'Quầy tiếp tân',
            brand: 'SpaceLens Fitness',
            price: 900000,
            unit: 'gói',
            stock_quantity: 999,
            status: true,
            asset_attributes: { custom_note: 'Tập không giới hạn + 2 buổi PT tặng kèm' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_PKG_003',
            category_name: 'Membership Package',
            name_product: 'Gói tập 6 tháng (Nâng cao)',
            zone_name: 'Quầy tiếp tân',
            brand: 'SpaceLens Fitness',
            price: 1600000,
            unit: 'gói',
            stock_quantity: 999,
            status: true,
            asset_attributes: { custom_note: 'Tập không giới hạn + Yoga + 5 buổi PT tặng kèm' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_PKG_004',
            category_name: 'Membership Package',
            name_product: 'Gói tập 12 tháng (VIP)',
            zone_name: 'Quầy tiếp tân',
            brand: 'SpaceLens Fitness',
            price: 2800000,
            unit: 'gói',
            stock_quantity: 999,
            status: true,
            asset_attributes: { custom_note: 'Toàn quyền truy cập + 12 buổi PT + ưu tiên đặt lịch' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_PKG_005',
            category_name: 'Membership Package',
            name_product: 'Gói PT 10 buổi (Personal Training)',
            zone_name: 'Khu vực VIP/PT',
            brand: 'SpaceLens Fitness',
            price: 2500000,
            unit: 'gói',
            stock_quantity: 999,
            status: true,
            asset_attributes: { custom_note: 'HLV cá nhân, lịch linh hoạt, lập trình tập theo mục tiêu' }
        },

        // ── SUPPLEMENT & PROTEIN ───────────────────────────────────────────────
        {
            location_id: locationId,
            product_id: 'TEST_SUP_001',
            category_name: 'Supplement',
            name_product: 'Whey Protein Gold Standard 2lb (Chocolate)',
            zone_name: 'Quầy tiếp tân',
            brand: 'Optimum Nutrition',
            price: 850000,
            unit: 'hộp',
            stock_quantity: 30,
            status: true,
            asset_attributes: { color: 'Nâu', custom_note: '24g protein/serving, 29 servings' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_SUP_002',
            category_name: 'Supplement',
            name_product: 'Whey Protein Gold Standard 5lb (Vanilla)',
            zone_name: 'Quầy tiếp tân',
            brand: 'Optimum Nutrition',
            price: 1950000,
            unit: 'hộp',
            stock_quantity: 20,
            status: true,
            asset_attributes: { color: 'Trắng', custom_note: '24g protein/serving, 74 servings' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_SUP_003',
            category_name: 'Supplement',
            name_product: 'Protein Bar Quest (Mixed Box 12 thanh)',
            zone_name: 'Quầy tiếp tân',
            brand: 'Quest Nutrition',
            price: 650000,
            unit: 'hộp',
            stock_quantity: 50,
            status: true,
            asset_attributes: { custom_note: '21g protein, ít đường, nhiều vị' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_SUP_004',
            category_name: 'Supplement',
            name_product: 'Creatine Monohydrate 300g',
            zone_name: 'Quầy tiếp tân',
            brand: 'Myprotein',
            price: 420000,
            unit: 'hộp',
            stock_quantity: 40,
            status: true,
            asset_attributes: { custom_note: '3g/serving, 100 servings, tăng sức mạnh' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_SUP_005',
            category_name: 'Supplement',
            name_product: 'BCAA 2:1:1 Instant 250g (Dưa hấu)',
            zone_name: 'Quầy tiếp tân',
            brand: 'Myprotein',
            price: 380000,
            unit: 'hộp',
            stock_quantity: 35,
            status: true,
            asset_attributes: { color: 'Đỏ', custom_note: 'Phục hồi cơ sau tập, giảm mệt mỏi' }
        },
        {
            location_id: locationId,
            product_id: 'TEST_SUP_006',
            category_name: 'Supplement',
            name_product: 'Mass Gainer Serious Mass 6lb',
            zone_name: 'Quầy tiếp tân',
            brand: 'Optimum Nutrition',
            price: 1250000,
            unit: 'hộp',
            stock_quantity: 15,
            status: true,
            asset_attributes: { custom_note: '50g protein, 250g carbs/serving, tăng cân hiệu quả' }
        },

        // ── MÁY CARDIO ─────────────────────────────────────────────────────────
        {
            location_id: locationId,
            product_id: 'TEST_CARDIO_TM_001',
            category_name: 'Máy Cardio',
            name_product: 'Máy chạy bộ điện Life Fitness T3',
            zone_name: 'Khu vực Cardio',
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
            location_id: locationId,
            product_id: 'TEST_CARDIO_EB_001',
            category_name: 'Máy Cardio',
            name_product: 'Xe đạp tập thể dục Technogym Bike',
            zone_name: 'Khu vực Cardio',
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
            location_id: locationId,
            product_id: 'TEST_CARDIO_EL_001',
            category_name: 'Máy Cardio',
            name_product: 'Máy tập Elliptical Precor EFX 885',
            zone_name: 'Khu vực Cardio',
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

        // ── MÁY TẬP CƠ ĐỊNH ────────────────────────────────────────────────────
        {
            location_id: locationId,
            product_id: 'TEST_MACHINE_CP_001',
            category_name: 'Máy Tập Cơ Định',
            name_product: 'Máy ép ngực Cable Crossover Technogym',
            zone_name: 'Khu vực Máy tập',
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
            location_id: locationId,
            product_id: 'TEST_MACHINE_LP_001',
            category_name: 'Máy Tập Cơ Định',
            name_product: 'Máy Leg Press Life Fitness Signature',
            zone_name: 'Khu vực Máy tập',
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

        // ── TẠ TỰ DO ───────────────────────────────────────────────────────────
        {
            location_id: locationId,
            product_id: 'TEST_WEIGHT_DB_001',
            category_name: 'Tạ Tự Do',
            name_product: 'Bộ tạ tay Dumbbell Rubber 2-50kg',
            zone_name: 'Khu vực Tạ tự do',
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
            location_id: locationId,
            product_id: 'TEST_WEIGHT_BB_001',
            category_name: 'Tạ Tự Do',
            name_product: 'Barbell Olympic 20kg Eleiko Sport',
            zone_name: 'Khu vực Tạ tự do',
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

        // ── PHỤ KIỆN ───────────────────────────────────────────────────────────
        {
            location_id: locationId,
            product_id: 'TEST_ACC_MAT_001',
            category_name: 'Phụ Kiện',
            name_product: 'Thảm tập yoga & stretching Manduka',
            zone_name: 'Khu vực Cardio',
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
            location_id: locationId,
            product_id: 'TEST_ACC_RM_001',
            category_name: 'Phụ Kiện',
            name_product: 'Con lăn foam roller massage TriggerPoint',
            zone_name: 'Khu vực Cardio',
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
        }
    ]);
    console.log(`[test-seed] ✓ Assets: ${assets.length} products created`);
    // ── 5. Customers (Gym Members) ────────────────────────────────────────────
    const today = new Date();
    const customers = await Customer.insertMany([
        {
            locationId,
            code: 'TEST_MEM_001',
            name: 'Nguyễn Văn Nam',
            phone: '0911234001',
            birthday: new Date('1992-06-12'),
            joinDate: new Date('2025-09-01'),
            status: 'ACTIVE',
            totalSessions: 78,
            lastVisit: new Date(today.getTime() - 1 * 864e5),
            favoriteMuscleGroups: ['Cardio', 'Legs'],
            note: 'Hội viên VIP, thường xuyên giờ cao điểm',
            history: [{
                date: new Date(today.getTime() - 864e5),
                check_in: new Date(today.getTime() - 864e5 + 8 * 3600e3),
                check_out: new Date(today.getTime() - 864e5 + 10 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_002',
            name: 'Trần Thị Hồng',
            phone: '0911234002',
            birthday: new Date('1997-02-28'),
            joinDate: new Date('2026-01-18'),
            status: 'ACTIVE',
            totalSessions: 24,
            lastVisit: new Date(today.getTime() - 3 * 864e5),
            favoriteMuscleGroups: ['Yoga', 'Core'],
            note: 'Tham gia lớp Yoga buổi chiều',
            history: [{
                date: new Date(today.getTime() - 3 * 864e5),
                check_in: new Date(today.getTime() - 3 * 864e5 + 18 * 3600e3),
                check_out: new Date(today.getTime() - 3 * 864e5 + 20 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_003',
            name: 'Lê Minh Hoàng',
            phone: '0911234003',
            birthday: new Date('1988-11-10'),
            joinDate: new Date('2025-11-05'),
            status: 'ACTIVE',
            totalSessions: 14,
            lastVisit: new Date(today.getTime() - 7 * 864e5),
            favoriteMuscleGroups: ['Strength', 'Back'],
            note: 'Tham gia phòng VIP/PT cuối tuần',
            history: [{
                date: new Date(today.getTime() - 7 * 864e5),
                check_in: new Date(today.getTime() - 7 * 864e5 + 19 * 3600e3),
                check_out: new Date(today.getTime() - 7 * 864e5 + 20 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_004',
            name: 'Phạm Thị Lan',
            phone: '0911234004',
            birthday: new Date('1995-03-15'),
            joinDate: new Date('2025-10-20'),
            status: 'ACTIVE',
            totalSessions: 55,
            lastVisit: new Date(today.getTime() - 1 * 864e5),
            favoriteMuscleGroups: ['Yoga', 'Flexibility'],
            note: 'Hội viên chăm chỉ, đến đúng giờ',
            history: [{
                date: new Date(today.getTime() - 864e5),
                check_in: new Date(today.getTime() - 864e5 + 7 * 3600e3),
                check_out: new Date(today.getTime() - 864e5 + 9 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_005',
            name: 'Đỗ Quang Hùng',
            phone: '0911234005',
            birthday: new Date('1990-07-22'),
            joinDate: new Date('2025-08-15'),
            status: 'ACTIVE',
            totalSessions: 102,
            lastVisit: new Date(today.getTime() - 2 * 864e5),
            favoriteMuscleGroups: ['Chest', 'Shoulders', 'Triceps'],
            note: 'Tập nặng, thường ở khu tạ',
            history: [{
                date: new Date(today.getTime() - 2 * 864e5),
                check_in: new Date(today.getTime() - 2 * 864e5 + 17 * 3600e3),
                check_out: new Date(today.getTime() - 2 * 864e5 + 19 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_006',
            name: 'Nguyễn Thị Mai',
            phone: '0911234006',
            birthday: new Date('2000-01-05'),
            joinDate: new Date('2026-02-01'),
            status: 'ACTIVE',
            totalSessions: 18,
            lastVisit: new Date(today.getTime() - 4 * 864e5),
            favoriteMuscleGroups: ['Cardio', 'Core'],
            note: 'Hội viên mới, đang xây dựng thói quen',
            history: [{
                date: new Date(today.getTime() - 4 * 864e5),
                check_in: new Date(today.getTime() - 4 * 864e5 + 6 * 3600e3),
                check_out: new Date(today.getTime() - 4 * 864e5 + 7.5 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_007',
            name: 'Trần Văn Bình',
            phone: '0911234007',
            birthday: new Date('1985-09-30'),
            joinDate: new Date('2025-06-01'),
            status: 'ACTIVE',
            totalSessions: 145,
            lastVisit: new Date(today.getTime() - 1 * 864e5),
            favoriteMuscleGroups: ['Back', 'Biceps', 'Legs'],
            note: 'HLV nội bộ kiêm hội viên VIP 12 tháng',
            history: [{
                date: new Date(today.getTime() - 864e5),
                check_in: new Date(today.getTime() - 864e5 + 9 * 3600e3),
                check_out: new Date(today.getTime() - 864e5 + 12 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_008',
            name: 'Vũ Thị Thanh',
            phone: '0911234008',
            birthday: new Date('1998-12-18'),
            joinDate: new Date('2026-03-10'),
            status: 'ACTIVE',
            totalSessions: 8,
            lastVisit: new Date(today.getTime() - 5 * 864e5),
            favoriteMuscleGroups: ['Yoga'],
            note: 'Học viên lớp Yoga sáng thứ 3-5',
            history: [{
                date: new Date(today.getTime() - 5 * 864e5),
                check_in: new Date(today.getTime() - 5 * 864e5 + 7 * 3600e3),
                check_out: new Date(today.getTime() - 5 * 864e5 + 8.5 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_009',
            name: 'Bùi Đức Thịnh',
            phone: '0911234009',
            birthday: new Date('1993-04-07'),
            joinDate: new Date('2025-12-01'),
            status: 'ACTIVE',
            totalSessions: 42,
            lastVisit: new Date(today.getTime() - 2 * 864e5),
            favoriteMuscleGroups: ['Cardio', 'Full Body'],
            note: 'Tập buổi sáng sớm, đặt lịch PT 2 lần/tuần',
            history: [{
                date: new Date(today.getTime() - 2 * 864e5),
                check_in: new Date(today.getTime() - 2 * 864e5 + 6 * 3600e3),
                check_out: new Date(today.getTime() - 2 * 864e5 + 8 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_010',
            name: 'Hoàng Thị Yến',
            phone: '0911234010',
            birthday: new Date('1994-08-25'),
            joinDate: new Date('2026-01-05'),
            status: 'ACTIVE',
            totalSessions: 30,
            lastVisit: new Date(today.getTime() - 3 * 864e5),
            favoriteMuscleGroups: ['Glutes', 'Legs', 'Core'],
            note: 'Quan tâm gói PT, đã hỏi giá',
            history: [{
                date: new Date(today.getTime() - 3 * 864e5),
                check_in: new Date(today.getTime() - 3 * 864e5 + 17 * 3600e3),
                check_out: new Date(today.getTime() - 3 * 864e5 + 19 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_011',
            name: 'Lý Văn Tùng',
            phone: '0911234011',
            birthday: new Date('1987-05-14'),
            joinDate: new Date('2025-07-20'),
            status: 'INACTIVE',
            totalSessions: 33,
            lastVisit: new Date(today.getTime() - 45 * 864e5),
            favoriteMuscleGroups: ['Strength'],
            note: 'Chưa gia hạn gói tập, cần chăm sóc',
            history: [{
                date: new Date(today.getTime() - 45 * 864e5),
                check_in: new Date(today.getTime() - 45 * 864e5 + 18 * 3600e3),
                check_out: new Date(today.getTime() - 45 * 864e5 + 20 * 3600e3),
                locationId
            }]
        },
        {
            locationId,
            code: 'TEST_MEM_012',
            name: 'Đinh Thị Thu',
            phone: '0911234012',
            birthday: new Date('1999-11-03'),
            joinDate: new Date('2025-10-01'),
            status: 'INACTIVE',
            totalSessions: 12,
            lastVisit: new Date(today.getTime() - 60 * 864e5),
            favoriteMuscleGroups: ['Yoga', 'Core'],
            note: 'Không tái tục, cần gửi ưu đãi kéo lại',
            history: [{
                date: new Date(today.getTime() - 60 * 864e5),
                check_in: new Date(today.getTime() - 60 * 864e5 + 9 * 3600e3),
                check_out: new Date(today.getTime() - 60 * 864e5 + 10.5 * 3600e3),
                locationId
            }]
        }
    ]);
    console.log(`[test-seed] ✓ Customers: ${customers.length} gym members created`);

    // ── 6. Users ──────────────────────────────────────────────────────────────
    const hashedPassword = await hashPassword(SEED_PASSWORD);
    const usersConfig = [
        {
            account: 'admin_test_gym',
            email: 'admin@test-gym.vn',
            role: 'ADMIN',
            displayName: 'Trần Thị Lan Anh',
            phone: '0912345678',
            note: 'Admin hệ thống test'
        },
        {
            account: 'manager_test_001',
            email: 'manager@test-gym.vn',
            role: 'MANAGER',
            displayName: 'Lê Hoàng Phúc',
            phone: '0923456789',
            note: 'Quản lý phòng gym test'
        }
    ];

    const users = [];
    for (const userConfig of usersConfig) {
        const userDoc = {
            account: userConfig.account,
            password: hashedPassword,
            email: userConfig.email,
            role: userConfig.role,
            location_id: locationId
        };

        const user = await User.findOneAndUpdate(
            { account: userConfig.account },
            { $set: userDoc },
            { upsert: true, new: true }
        );
        users.push(user);
    }
    console.log(`[test-seed] ✓ Users: ${users.length} accounts created`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n[test-seed] ═══════════════════════════════════════════════════════');
    console.log('[test-seed] ✅ SEED COMPLETED SUCCESSFULLY');
    console.log('[test-seed] ═══════════════════════════════════════════════════════');
    console.log(`[test-seed] Location    : ${location.name}`);
    console.log(`[test-seed] Code        : ${locationId}`);
    console.log(`[test-seed] Address     : ${location.address}`);
    console.log(`[test-seed] Hours       : ${location.business_hours.open} – ${location.business_hours.close}`);
    console.log(`[test-seed] Manager     : ${location.manager_info.name} (${location.manager_info.phone})`);
    console.log(`[test-seed] ───────────────────────────────────────────────────────────`);
    console.log(`[test-seed] Cameras     : ${cameras.length}`);
    cameras.forEach(cam => {
        const config = CAMERAS_CONFIG.find(c => c.camera_code === cam.camera_code);
        console.log(`[test-seed]   • ${cam.camera_code.padEnd(25)} ${cam.camera_name}`);
        if (config?.zone_note) {
            console.log(`[test-seed]     ${config.zone_note}`);
        }
    });
    console.log(`[test-seed] ───────────────────────────────────────────────────────────`);
    console.log(`[test-seed] Zones       : ${zones.length}`);
    zones.forEach(zone => {
        console.log(`[test-seed]   • ${zone.zone_id.padEnd(25)} ${zone.zone_name} (${zone.category_name})`);
    });
    console.log(`[test-seed] ───────────────────────────────────────────────────────────`);
    console.log(`[test-seed] Assets      : ${assets.length}`);
    const assetsByCategory = assets.reduce((acc, asset) => {
        if (!acc[asset.category_name]) acc[asset.category_name] = [];
        acc[asset.category_name].push(asset);
        return acc;
    }, {});
    Object.entries(assetsByCategory).forEach(([category, items]) => {
        console.log(`[test-seed]   [${category}] — ${items.length} items`);
        items.slice(0, 3).forEach(asset => {
            const statusLabel = asset.status ? '✓' : '✗';
            console.log(`[test-seed]     ${statusLabel} ${asset.product_id.padEnd(20)} ${asset.name_product}`);
        });
        if (items.length > 3) {
            console.log(`[test-seed]     ... and ${items.length - 3} more`);
        }
    });
    console.log(`[test-seed] ───────────────────────────────────────────────────────────`);
    console.log(`[test-seed] Customers   : ${customers.length} gym members`);
    const activeMembers = customers.filter(c => c.status === 'ACTIVE').length;
    const inactiveMembers = customers.filter(c => c.status === 'INACTIVE').length;
    console.log(`[test-seed]   • Active  : ${activeMembers}`);
    console.log(`[test-seed]   • Inactive: ${inactiveMembers}`);
    console.log(`[test-seed] ───────────────────────────────────────────────────────────`);
    console.log(`[test-seed] Users       : ${users.length} accounts`);
    usersConfig.forEach(u => {
        console.log(`[test-seed]   • ${u.account.padEnd(30)} ${u.role.padEnd(12)} ${u.displayName}`);
    });
    console.log(`[test-seed] ───────────────────────────────────────────────────────────`);
    console.log(`[test-seed] Password    : ${SEED_PASSWORD} (all accounts)`);
    console.log('[test-seed] ═══════════════════════════════════════════════════════\n');
}

// ── Execute ───────────────────────────────────────────────────────────────────
seed()
    .then(() => {
        console.log('[test-seed] Disconnecting from MongoDB...');
        return mongoose.disconnect();
    })
    .then(() => {
        console.log('[test-seed] ✅ Done!');
        process.exit(0);
    })
    .catch(err => {
        console.error('[test-seed] ❌ ERROR:', err.message);
        console.error(err.stack);
        mongoose.disconnect();
        process.exit(1);
    });
