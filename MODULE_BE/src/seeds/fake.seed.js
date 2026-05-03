require('dotenv').config();
const mongoose = require('mongoose');

const Location = require('../schemas/location.schema');
const Asset = require('../schemas/asset.schema');
const Camera = require('../schemas/camera.schema');
const Zone = require('../schemas/zone.schema');
const Session = require('../schemas/session.schema');
const InteractionLog = require('../schemas/interactionLog.schema');
const BusinessEvent = require('../schemas/businessEvent.schema');
const LocationStats = require('../schemas/locationStats.schema');
const ZoneStats = require('../schemas/zoneStats.schema');
const Heatmap = require('../schemas/heatmap.schema');
const FlowPatterns = require('../schemas/flowPatterns.schema');
const CustomerCareRule = require('../schemas/customerCareRule.schema');
const Notification = require('../schemas/notification.schema');
const Customer = require('../schemas/customer.schema');
const User = require('../schemas/user.schema');
const { hashPassword } = require('../middlewares/security.middleware');
const { dateUtil, getCurrnetDateVN } = require('../utils/date.util');

const MONGO_URI = process.env.URI_MONGODB || process.env.MONGO_URI;
const LOCATION_CODE = (process.env.SEED_LOCATION_CODE || 'LOC_TEST_001').toUpperCase();
const SECONDARY_LOCATION_CODE = (process.env.SEED_SECONDARY_LOCATION_CODE || 'LOC_TEST_002').toUpperCase();
const TEST_USER_PASSWORD = process.env.SEED_TEST_PASSWORD || '123456';
const FRONT_CAMERA_CODE = 'CAM_FRONT_057601';
const CHECKOUT_CAMERA_CODE = 'CAM_CHECKOUT_057601';
const ZONE_IDS = {
    checkout: 'ZONE_CHECKOUT_MAIN',
    entrance: 'ZONE_ENTRANCE_MAIN',
    sale: 'ZONE_SALE_MAIN',
    premium: 'ZONE_PREMIUM_MAIN'
};
const SHOULD_CLEAN = process.argv.includes('--clean');
const KEEP_LOCATION_CAMERA = process.argv.includes('--keep-location-camera');

async function ensureTestAccounts({ primaryLocationId, secondaryLocationId }) {
    const hashedPassword = await hashPassword(TEST_USER_PASSWORD);

    await User.updateOne(
        { account: 'manager_test_1store' },
        {
            $set: {
                account: 'manager_test_1store',
                password: hashedPassword,
                email: 'manager.test.1store@spacelens.vn',
                role: 'MANAGER',
                location_id: primaryLocationId
            }
        },
        { upsert: true }
    );

    await User.updateOne(
        { account: 'admin_test_2stores' },
        {
            $set: {
                account: 'admin_test_2stores',
                password: hashedPassword,
                email: 'admin.test.2stores@spacelens.vn',
                role: 'ADMIN',
                location_id: primaryLocationId
            }
        },
        { upsert: true }
    );

    return {
        manager: {
            account: 'manager_test_1store',
            role: 'MANAGER',
            stores: [primaryLocationId]
        },
        admin: {
            account: 'admin_test_2stores',
            role: 'ADMIN',
            stores: [primaryLocationId, secondaryLocationId]
        }
    };
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createHeatmapMatrix(height, width) {
    const matrix = [];
    for (let y = 0; y < height; y += 1) {
        const row = [];
        for (let x = 0; x < width; x += 1) {
            row.push(randomInt(0, 15));
        }
        matrix.push(row);
    }
    return matrix;
}

function createHeatmapSeries({ locationId, cameraId, date, count = 5, intervalMs = 30000 }) {
    const baseTime = Date.now();
    return Array.from({ length: count }).map((_, index) => ({
        location_id: locationId,
        camera_id: cameraId,
        date,
        time_stamp: baseTime + index * intervalMs,
        width_matrix: 8,
        height_matrix: 6,
        grid_size: 60,
        frame_width: 1280,
        frame_height: 720,
        heatmap_matrix: createHeatmapMatrix(6, 8)
    }));
}

async function cleanupLocationData(locationId, zoneIds, options = {}) {
    const { keepLocationCamera = false } = options;

    const deleteTasks = [
        Asset.deleteMany({ location_id: locationId }),
        Zone.deleteMany({ location_id: locationId }),
        Session.deleteMany({ location_id: locationId }),
        InteractionLog.deleteMany({ location_id: locationId }),
        BusinessEvent.deleteMany({ location_id: locationId }),
        LocationStats.deleteMany({ location_id: locationId }),
        ZoneStats.deleteMany({ location_id: locationId }),
        Heatmap.deleteMany({ location_id: locationId }),
        FlowPatterns.deleteMany({ location_id: locationId }),
        CustomerCareRule.deleteMany({ location_id: locationId })
    ];

    if (!keepLocationCamera) {
        deleteTasks.push(Camera.deleteMany({ location_id: locationId }));
        deleteTasks.push(Notification.deleteMany({ location_id: locationId }));
        deleteTasks.push(Customer.deleteMany({ locationId: locationId }));
    }

    await Promise.all(deleteTasks);

    if (Array.isArray(zoneIds) && zoneIds.length > 0) {
        await ZoneStats.deleteMany({ zone_id: { $in: zoneIds } });
    }
}

async function seed() {
    if (!MONGO_URI) {
        throw new Error('Missing MongoDB URI. Please set URI_MONGODB (or MONGO_URI) in .env');
    }

    await mongoose.connect(MONGO_URI, { dbName: 'spacelens' });
    console.log('[seed] Connected MongoDB');

    const { startDate: today } = dateUtil({ type: 'today' });
    const locationNameSuffix = randomInt(100, 999);

    let location = await Location.findOne({ location_code: LOCATION_CODE });
    if (!location) {
        location = await Location.create({
            location_code: LOCATION_CODE,
            name: `Demo Store ${locationNameSuffix}`,
            address: '123 Nguyen Hue, District 1, HCMC',
            type_model: 'RETAIL',
            manager_info: {
                name: 'Store Manager',
                phone: '0900000000',
                email: `manager.${LOCATION_CODE.toLowerCase()}@example.com`
            },
            business_hours: {
                open: '08:00',
                close: '22:00',
                timezone: 'Asia/Ho_Chi_Minh'
            }
        });
    }

    let secondaryLocation = await Location.findOne({ location_code: SECONDARY_LOCATION_CODE });
    if (!secondaryLocation) {
        secondaryLocation = await Location.create({
            location_code: SECONDARY_LOCATION_CODE,
            name: `Demo Store ${randomInt(100, 999)}`,
            address: '456 Le Loi, District 1, HCMC',
            type_model: 'RETAIL',
            manager_info: {
                name: 'Secondary Store Manager',
                phone: '0911111111',
                email: `manager.${SECONDARY_LOCATION_CODE.toLowerCase()}@example.com`
            },
            business_hours: {
                open: '08:00',
                close: '22:00',
                timezone: 'Asia/Ho_Chi_Minh'
            }
        });
    }

    const locationId = location.location_code;
    const existingZones = await Zone.find({ location_id: locationId }).select('zone_id').lean();
    const existingZoneIds = existingZones.map((z) => z.zone_id);

    if (SHOULD_CLEAN) {
        await cleanupLocationData(locationId, existingZoneIds, { keepLocationCamera: KEEP_LOCATION_CAMERA });
        console.log(`[seed] Cleaned old fake data for ${locationId}`);
        if (KEEP_LOCATION_CAMERA) {
            console.log('[seed] Keep mode: preserved location/camera data');
        }
    }

    const uniqueSuffix = Date.now().toString().slice(-6);

    const assets = await Asset.insertMany([
        // Danh mục: Đồ uống
        {
            location_id: locationId,
            product_id: `SP_MILK_${uniqueSuffix}`,
            category_name: 'Đồ uống',
            name_product: 'Sữa tươi không đường',
            zone_name: 'Quầy thanh toán',
            brand: 'Vinamilk',
            price: 32000,
            unit: 'Hộp',
            stock_quantity: 120,
            status: true
        },
        {
            location_id: locationId,
            product_id: `SP_WATER_${uniqueSuffix}`,
            category_name: 'Đồ uống',
            name_product: 'Nước khoáng',
            zone_name: 'Lối vào chính',
            brand: 'Lavie',
            price: 10000,
            unit: 'Chai',
            stock_quantity: 80,
            status: true
        },
        {
            location_id: locationId,
            product_id: `SP_COFFEE_${uniqueSuffix}`,
            category_name: 'Đồ uống',
            name_product: 'Cà phê hạt',
            zone_name: 'Quầy thanh toán',
            brand: 'Trung Nguyên',
            price: 85000,
            unit: 'Gói',
            stock_quantity: 45,
            status: true
        },
        // Danh mục: Bánh kẹo
        {
            location_id: locationId,
            product_id: `SP_COOKIE_${uniqueSuffix}`,
            category_name: 'Bánh kẹo',
            name_product: 'Bánh quy bơ',
            zone_name: 'Khu vực giảm giá',
            brand: 'Cosy',
            price: 55000,
            unit: 'Hộp',
            stock_quantity: 25,
            status: true
        },
        {
            location_id: locationId,
            product_id: `SP_SNACK_${uniqueSuffix}`,
            category_name: 'Bánh kẹo',
            name_product: 'Snack khoai tây',
            zone_name: 'Lối vào chính',
            brand: 'Oishi',
            price: 12000,
            unit: 'Gói',
            stock_quantity: 8,
            status: true
        },
        {
            location_id: locationId,
            product_id: `SP_CANDY_${uniqueSuffix}`,
            category_name: 'Bánh kẹo',
            name_product: 'Kẹo Halls',
            zone_name: 'Quầy thanh toán',
            brand: 'Halls',
            price: 8000,
            unit: 'Gói',
            stock_quantity: 0,
            status: false
        },
        // Danh mục: Đồ khô
        {
            location_id: locationId,
            product_id: `SP_NOODLE_${uniqueSuffix}`,
            category_name: 'Đồ khô',
            name_product: 'Mì ăn liền vị bò',
            zone_name: 'Khu vực giảm giá',
            brand: 'Hảo Hảo',
            price: 4500,
            unit: 'Gói',
            stock_quantity: 0,
            status: false
        },
        {
            location_id: locationId,
            product_id: `SP_OIL_${uniqueSuffix}`,
            category_name: 'Đồ khô',
            name_product: 'Dầu ăn',
            zone_name: 'Quầy thanh toán',
            brand: 'Neptune',
            price: 69000,
            unit: 'Chai',
            stock_quantity: 42,
            status: true
        },
        {
            location_id: locationId,
            product_id: `SP_RICE_${uniqueSuffix}`,
            category_name: 'Đồ khô',
            name_product: 'Gạo jasmine',
            zone_name: 'Mỹ phẩm cao cấp',
            brand: 'ST25',
            price: 125000,
            unit: 'Túi 5kg',
            stock_quantity: 18,
            status: true
        },
        // Danh mục: Gia dụng
        {
            location_id: locationId,
            product_id: `SP_DETERGENT_${uniqueSuffix}`,
            category_name: 'Gia dụng',
            name_product: 'Bột giặt',
            zone_name: 'Quầy thanh toán',
            brand: 'Ariel',
            price: 135000,
            unit: 'Túi',
            stock_quantity: 60,
            status: true
        },
        {
            location_id: locationId,
            product_id: `SP_HANDWASH_${uniqueSuffix}`,
            category_name: 'Gia dụng',
            name_product: 'Nước rửa tay',
            zone_name: 'Mỹ phẩm cao cấp',
            brand: 'Lifebuoy',
            price: 78000,
            unit: 'Chai',
            stock_quantity: 15,
            status: true
        },
        {
            location_id: locationId,
            product_id: `SP_SOAP_${uniqueSuffix}`,
            category_name: 'Gia dụng',
            name_product: 'Xà phòng tắm',
            zone_name: 'Lối vào chính',
            brand: 'Dettol',
            price: 35000,
            unit: 'Cái',
            stock_quantity: 35,
            status: true
        }
    ]);

    const defaultCameras = [
        {
            location_id: locationId,
            camera_name: 'Front Door Cam',
            camera_code: FRONT_CAMERA_CODE,
            rtsp_url: 'rtsp://demo:demo@127.0.0.1:554/front',
            url_image_snapshot: 'https://res.cloudinary.com/dospk2dnl/image/upload/v1765270843/uploads/s8jfq1zamsxmbaopoarm.png',
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
        },
        {
            location_id: locationId,
            camera_name: 'Checkout Cam',
            camera_code: CHECKOUT_CAMERA_CODE,
            rtsp_url: 'rtsp://demo:demo@127.0.0.1:554/checkout',
            url_image_snapshot: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
            status: 'active',
            installation_date: getCurrnetDateVN()
        }
    ];

    if (KEEP_LOCATION_CAMERA) {
        await Promise.all(defaultCameras.map((cameraDoc) => Camera.updateOne(
            {
                location_id: locationId,
                camera_code: cameraDoc.camera_code
            },
            { $setOnInsert: cameraDoc },
            { upsert: true }
        )));
    }

    const cameras = KEEP_LOCATION_CAMERA
        ? await Camera.find({
            location_id: locationId,
            camera_code: { $in: [FRONT_CAMERA_CODE, CHECKOUT_CAMERA_CODE] }
        }).sort({ camera_code: 1 })
        : await Camera.insertMany(defaultCameras);

    const frontCamera = cameras.find((camera) => camera.camera_code === FRONT_CAMERA_CODE);
    const checkoutCamera = cameras.find((camera) => camera.camera_code === CHECKOUT_CAMERA_CODE);

    if (!frontCamera || !checkoutCamera) {
        throw new Error('Failed to initialize default cameras for seed data');
    }

    const cameraCodeByName = {
        frontDoor: frontCamera.camera_code,
        checkout: checkoutCamera.camera_code
    };

    const zones = await Zone.insertMany([
        {
            location_id: locationId,
            camera_id: cameraCodeByName.frontDoor,
            zone_name: 'Quầy thanh toán',
            zone_id: ZONE_IDS.checkout,
            category_name: 'Thanh toán',
            function_type: 'Checkout Counter',
            // Normalized [0-1] — tự scale theo frame size thực tế
            // Vùng trái frame, chiếm ~30% chiều rộng, 25-55% chiều cao
            polygon_coordinates: [[0.05, 0.25], [0.35, 0.25], [0.35, 0.55], [0.05, 0.55]]
        },
        {
            location_id: locationId,
            camera_id: cameraCodeByName.frontDoor,
            zone_name: 'Lối vào chính',
            zone_id: ZONE_IDS.entrance,
            category_name: 'Đồ uống',
            function_type: 'Main Entrance',
            // Vùng giữa-phải frame, chiếm 40-70% chiều rộng, 20-60% chiều cao
            polygon_coordinates: [[0.40, 0.20], [0.70, 0.20], [0.70, 0.60], [0.40, 0.60]]
        },
        {
            location_id: locationId,
            camera_id: cameraCodeByName.checkout,
            zone_name: 'Khu vực giảm giá',
            zone_id: ZONE_IDS.sale,
            category_name: 'Bánh kẹo',
            function_type: 'Sale Area',
            // Vùng trái-giữa frame
            polygon_coordinates: [[0.05, 0.15], [0.55, 0.15], [0.55, 0.65], [0.05, 0.65]]
        },
        {
            location_id: locationId,
            camera_id: cameraCodeByName.checkout,
            zone_name: 'Mỹ phẩm cao cấp',
            zone_id: ZONE_IDS.premium,
            category_name: 'Gia dụng',
            function_type: 'Premium Products',
            // Vùng phải frame
            polygon_coordinates: [[0.60, 0.15], [0.95, 0.15], [0.95, 0.75], [0.60, 0.75]]
        }
    ]);

    const sessionUuid1 = `${locationId}_${frontCamera._id}_1001_${uniqueSuffix}`;
    const sessionUuid2 = `${locationId}_${frontCamera._id}_1002_${uniqueSuffix}`;
    const sessionUuid3 = `${locationId}_${checkoutCamera._id}_1003_${uniqueSuffix}`;

    // ── Extra sessions cho FP-Growth & PrefixSpan mining ──────────────────
    // Cần đủ sessions với pattern lặp lại để 2 thuật toán tìm được kết quả
    // Lộ trình phổ biến được thiết kế:
    //   A: entrance → sale → checkout  (lộ trình mua sắm cơ bản)
    //   B: entrance → premium → checkout (lộ trình mua hàng cao cấp)
    //   C: entrance → sale → premium → checkout (lộ trình dài)
    //   D: premium → checkout (lộ trình ngắn)
    const Z = {
        e: zones[1].zone_id,   // entrance
        s: zones[2].zone_id,   // sale
        p: zones[3].zone_id,   // premium
        c: zones[0].zone_id    // checkout
    };

    // Helper tạo zone_sequence với entry_time tăng dần
    const makeSeq = (zoneList, baseMinutes) => zoneList.map((zid, i) => ({
        zone_id: zid,
        entry_time: new Date(today.getTime() + (baseMinutes + i * 5) * 60 * 1000),
        exit_time:  new Date(today.getTime() + (baseMinutes + i * 5 + 4) * 60 * 1000),
        dwell_time_seconds: 240
    }));

    const extraSessions = [
        // Lộ trình A: entrance → sale → checkout (8 sessions)
        { uuid: `${locationId}_MINING_A1_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 120 },
        { uuid: `${locationId}_MINING_A2_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 135 },
        { uuid: `${locationId}_MINING_A3_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 150 },
        { uuid: `${locationId}_MINING_A4_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 165 },
        { uuid: `${locationId}_MINING_A5_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 180 },
        { uuid: `${locationId}_MINING_A6_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 195 },
        { uuid: `${locationId}_MINING_A7_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 210 },
        { uuid: `${locationId}_MINING_A8_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.c], base: 225 },
        // Lộ trình B: entrance → premium → checkout (6 sessions)
        { uuid: `${locationId}_MINING_B1_${uniqueSuffix}`, seq: [Z.e, Z.p, Z.c], base: 240 },
        { uuid: `${locationId}_MINING_B2_${uniqueSuffix}`, seq: [Z.e, Z.p, Z.c], base: 255 },
        { uuid: `${locationId}_MINING_B3_${uniqueSuffix}`, seq: [Z.e, Z.p, Z.c], base: 270 },
        { uuid: `${locationId}_MINING_B4_${uniqueSuffix}`, seq: [Z.e, Z.p, Z.c], base: 285 },
        { uuid: `${locationId}_MINING_B5_${uniqueSuffix}`, seq: [Z.e, Z.p, Z.c], base: 300 },
        { uuid: `${locationId}_MINING_B6_${uniqueSuffix}`, seq: [Z.e, Z.p, Z.c], base: 315 },
        // Lộ trình C: entrance → sale → premium → checkout (4 sessions)
        { uuid: `${locationId}_MINING_C1_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.p, Z.c], base: 330 },
        { uuid: `${locationId}_MINING_C2_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.p, Z.c], base: 345 },
        { uuid: `${locationId}_MINING_C3_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.p, Z.c], base: 360 },
        { uuid: `${locationId}_MINING_C4_${uniqueSuffix}`, seq: [Z.e, Z.s, Z.p, Z.c], base: 375 },
        // Lộ trình D: premium → checkout (4 sessions)
        { uuid: `${locationId}_MINING_D1_${uniqueSuffix}`, seq: [Z.p, Z.c], base: 390 },
        { uuid: `${locationId}_MINING_D2_${uniqueSuffix}`, seq: [Z.p, Z.c], base: 405 },
        { uuid: `${locationId}_MINING_D3_${uniqueSuffix}`, seq: [Z.p, Z.c], base: 420 },
        { uuid: `${locationId}_MINING_D4_${uniqueSuffix}`, seq: [Z.p, Z.c], base: 435 },
    ];

    await Session.insertMany(extraSessions.map(({ uuid, seq, base }) => ({
        location_id: locationId,
        session_uuid: uuid,
        entry_time: new Date(today.getTime() + base * 60 * 1000),
        exit_time:  new Date(today.getTime() + (base + seq.length * 5) * 60 * 1000),
        total_dwell_time_seconds: seq.length * 240,
        zone_sequence: makeSeq(seq, base)
    })));

    console.log(`[seed] extra mining sessions=${extraSessions.length} (A:8, B:6, C:4, D:4)`);

    await Session.insertMany([
        {
            location_id: locationId,
            session_uuid: sessionUuid1,
            person_id: 'P1001',
            entry_time: new Date(today.getTime() + (9 * 60 + 10) * 60 * 1000),
            exit_time: new Date(today.getTime() + (9 * 60 + 18) * 60 * 1000),
            total_dwell_time_seconds: 480,
            zone_sequence: [
                {
                    zone_id: zones[0].zone_id,
                    entry_time: new Date(today.getTime() + (9 * 60 + 10) * 60 * 1000),
                    exit_time: new Date(today.getTime() + (9 * 60 + 14) * 60 * 1000),
                    dwell_time_seconds: 240
                },
                {
                    zone_id: zones[2].zone_id,
                    entry_time: new Date(today.getTime() + (9 * 60 + 14) * 60 * 1000),
                    exit_time: new Date(today.getTime() + (9 * 60 + 18) * 60 * 1000),
                    dwell_time_seconds: 240
                }
            ]
        },
        {
            location_id: locationId,
            session_uuid: sessionUuid2,
            person_id: 'P1002',
            entry_time: new Date(today.getTime() + (10 * 60 + 5) * 60 * 1000),
            exit_time: new Date(today.getTime() + (10 * 60 + 21) * 60 * 1000),
            total_dwell_time_seconds: 960,
            zone_sequence: [
                {
                    zone_id: zones[1].zone_id,
                    entry_time: new Date(today.getTime() + (10 * 60 + 6) * 60 * 1000),
                    exit_time: new Date(today.getTime() + (10 * 60 + 14) * 60 * 1000),
                    dwell_time_seconds: 480
                },
                {
                    zone_id: zones[2].zone_id,
                    entry_time: new Date(today.getTime() + (10 * 60 + 14) * 60 * 1000),
                    exit_time: new Date(today.getTime() + (10 * 60 + 21) * 60 * 1000),
                    dwell_time_seconds: 420
                }
            ]
        },
        {
            location_id: locationId,
            session_uuid: sessionUuid3,
            person_id: 'P1003',
            entry_time: new Date(today.getTime() + (11 * 60 + 2) * 60 * 1000),
            exit_time: new Date(today.getTime() + (11 * 60 + 31) * 60 * 1000),
            total_dwell_time_seconds: 1320,
            zone_sequence: [
                {
                    zone_id: zones[3].zone_id,
                    entry_time: new Date(today.getTime() + (11 * 60 + 3) * 60 * 1000),
                    exit_time: new Date(today.getTime() + (11 * 60 + 18) * 60 * 1000),
                    dwell_time_seconds: 900
                },
                {
                    zone_id: zones[0].zone_id,
                    entry_time: new Date(today.getTime() + (11 * 60 + 18) * 60 * 1000),
                    exit_time: new Date(today.getTime() + (11 * 60 + 25) * 60 * 1000),
                    dwell_time_seconds: 420
                }
            ]
        }
    ]);

    await InteractionLog.insertMany([
        {
            session_uuid: sessionUuid1,
            location_id: locationId,
            zone_id: zones[0].zone_id,
            asset_id: String(assets[0]._id),
            event_type: 'stop',
            start_time: new Date(today.getTime() + (9 * 60 + 10) * 60 * 1000),
            last_heartbeat: new Date(today.getTime() + (9 * 60 + 14) * 60 * 1000),
            duration_seconds: 240,
            status: 'ended'
        },
        {
            session_uuid: sessionUuid1,
            location_id: locationId,
            zone_id: zones[2].zone_id,
            asset_id: String(assets[3]._id),
            event_type: 'stop',
            start_time: new Date(today.getTime() + (9 * 60 + 15) * 60 * 1000),
            last_heartbeat: new Date(today.getTime() + (9 * 60 + 18) * 60 * 1000),
            duration_seconds: 180,
            status: 'ended'
        },
        {
            session_uuid: sessionUuid2,
            location_id: locationId,
            zone_id: zones[1].zone_id,
            asset_id: String(assets[1]._id),
            event_type: 'stop',
            start_time: new Date(today.getTime() + (10 * 60 + 6) * 60 * 1000),
            last_heartbeat: new Date(today.getTime() + (10 * 60 + 14) * 60 * 1000),
            duration_seconds: 480,
            status: 'ended'
        },
        {
            session_uuid: sessionUuid2,
            location_id: locationId,
            zone_id: zones[2].zone_id,
            asset_id: String(assets[4]._id),
            event_type: 'stop',
            start_time: new Date(today.getTime() + (10 * 60 + 16) * 60 * 1000),
            last_heartbeat: new Date(today.getTime() + (10 * 60 + 20) * 60 * 1000),
            duration_seconds: 240,
            status: 'ended'
        },
        {
            session_uuid: sessionUuid3,
            location_id: locationId,
            zone_id: zones[3].zone_id,
            asset_id: String(assets[10]._id),
            event_type: 'stop',
            start_time: new Date(today.getTime() + (11 * 60 + 5) * 60 * 1000),
            last_heartbeat: new Date(today.getTime() + (11 * 60 + 18) * 60 * 1000),
            duration_seconds: 780,
            status: 'ended'
        },
        {
            session_uuid: sessionUuid3,
            location_id: locationId,
            zone_id: zones[0].zone_id,
            asset_id: String(assets[0]._id),
            event_type: 'stop',
            start_time: new Date(today.getTime() + (11 * 60 + 19) * 60 * 1000),
            last_heartbeat: new Date(today.getTime() + (11 * 60 + 25) * 60 * 1000),
            duration_seconds: 360,
            status: 'ended'
        }
    ]);

    const businessEvents = await BusinessEvent.insertMany([
        {
            location_id: locationId,
            event_code: `INV_${uniqueSuffix}_001`,
            type: 'SALE',
            total_amount: assets[0].price,
            discount: 0,
            payment_method: 'Credit Card',
            status: 'COMPLETED',
            date: new Date(today.getTime() + (9 * 60 + 17) * 60 * 1000),
            event_details: [
                {
                    item_id: String(assets[0]._id),
                    item_name: assets[0].name_product,
                    quantity: 1,
                    unit_price: assets[0].price,
                    total_price: assets[0].price
                }
            ]
        },
        {
            location_id: locationId,
            event_code: `INV_${uniqueSuffix}_002`,
            type: 'SALE',
            total_amount: assets[1].price + assets[2].price,
            discount: 15000,
            payment_method: 'Cash',
            status: 'COMPLETED',
            date: new Date(today.getTime() + (10 * 60 + 20) * 60 * 1000),
            event_details: [
                {
                    item_id: String(assets[1]._id),
                    item_name: assets[1].name_product,
                    quantity: 1,
                    unit_price: assets[1].price,
                    total_price: assets[1].price
                },
                {
                    item_id: String(assets[2]._id),
                    item_name: assets[2].name_product,
                    quantity: 1,
                    unit_price: assets[2].price,
                    total_price: assets[2].price
                }
            ]
        }
    ]);

    const totalRevenue = businessEvents.reduce((sum, event) => sum + event.total_amount - event.discount, 0);
    const totalVisitors = 3;
    const totalEvents = businessEvents.length;

    await LocationStats.updateOne(
        { location_id: locationId, date: today },
        {
            $set: {
                location_id: locationId,
                date: today,
                kpis: {
                    total_visitors: totalVisitors,
                    total_revenue: totalRevenue,
                    total_events: totalEvents,
                    conversion_rate: Number(((totalEvents / totalVisitors) * 100).toFixed(2)),
                    avg_store_dwell_time: 720,
                    avg_basket_value: Number((totalRevenue / totalEvents).toFixed(2))
                },
                realtime: {
                    people_current: randomInt(0, 8),
                    checkout_length: randomInt(0, 4)
                },
                chart_data: Array.from({ length: 24 }).map((_, hour) => ({
                    hour,
                    people_count: randomInt(0, 20),
                    total_revenue: hour >= 9 && hour <= 20 ? randomInt(0, 10000000) : 0
                })),
                top_assets: [
                    {
                        asset_id: String(assets[1]._id),
                        asset_name: assets[1].name_product,
                        total_quantity: 1,
                        total_revenue: assets[1].price,
                        rank: 1
                    },
                    {
                        asset_id: String(assets[0]._id),
                        asset_name: assets[0].name_product,
                        total_quantity: 1,
                        total_revenue: assets[0].price,
                        rank: 2
                    }
                ]
            }
        },
        { upsert: true }
    );

    await ZoneStats.insertMany([
        {
            location_id: locationId,
            zone_id: zones[0].zone_id,
            camera_code: zones[0].camera_id,
            date: today,
            trend: 'up',
            performance: {
                people_count: 42,
                total_sales_value: 180000,
                total_events: 18,
                conversion_rate: 42.86,
                avg_dwell_time: 310,
                total_stop_events: 16,
                top_asset_id: String(assets[0]._id),
                peak_hour: 11
            }
        },
        {
            location_id: locationId,
            zone_id: zones[1].zone_id,
            camera_code: zones[1].camera_id,
            date: today,
            trend: 'stable',
            performance: {
                people_count: 55,
                total_sales_value: 220000,
                total_events: 22,
                conversion_rate: 40,
                avg_dwell_time: 120,
                total_stop_events: 20,
                top_asset_id: String(assets[1]._id),
                peak_hour: 11
            }
        },
        {
            location_id: locationId,
            zone_id: zones[2].zone_id,
            camera_code: zones[2].camera_id,
            date: today,
            trend: 'down',
            performance: {
                people_count: 30,
                total_sales_value: 70000,
                total_events: 10,
                conversion_rate: 33.33,
                avg_dwell_time: 450,
                total_stop_events: 14,
                top_asset_id: String(assets[2]._id),
                peak_hour: 12
            }
        },
        {
            location_id: locationId,
            zone_id: zones[3].zone_id,
            camera_code: zones[3].camera_id,
            date: today,
            trend: 'stable',
            performance: {
                people_count: 24,
                total_sales_value: 45000,
                total_events: 7,
                conversion_rate: 29.17,
                avg_dwell_time: 140,
                total_stop_events: 9,
                top_asset_id: String(assets[10]._id),
                peak_hour: 11
            }
        }
    ]);

    await Heatmap.insertMany([
        ...createHeatmapSeries({
            locationId,
            cameraId: frontCamera.camera_code,
            date: today,
            count: 6,
            intervalMs: 30 * 1000
        })
    ]);

    // ── Dữ liệu 7 ngày (6 ngày trước + hôm nay) cho dashboard charts ──────
    const DAYS = 7;
    const locationStatsBulk = [];
    const zoneStatsBulk = [];
    const sessionsBulk = [];

    for (let d = DAYS - 1; d >= 1; d--) {
        const dayDate = new Date(today.getTime() - d * 24 * 60 * 60 * 1000);
        const visitors = randomInt(20, 80);
        const revenue = randomInt(500000, 5000000);
        const events = randomInt(5, 20);
        const daySuffix = `${uniqueSuffix}_D${d}`;

        // LocationStats cho ngày này
        locationStatsBulk.push({
            location_id: locationId,
            date: dayDate,
            kpis: {
                total_visitors: visitors,
                total_revenue: revenue,
                total_events: events,
                conversion_rate: Number(((events / visitors) * 100).toFixed(2)),
                avg_store_dwell_time: randomInt(300, 900),
                avg_basket_value: Number((revenue / events).toFixed(2))
            },
            realtime: { people_current: 0, checkout_length: 0 },
            chart_data: Array.from({ length: 24 }).map((_, hour) => ({
                hour,
                people_count: hour >= 9 && hour <= 20 ? randomInt(0, 15) : 0,
                total_revenue: hour >= 9 && hour <= 20 ? randomInt(0, 500000) : 0
            })),
            top_assets: []
        });

        // ZoneStats cho ngày này
        zones.forEach((zone) => {
            zoneStatsBulk.push({
                location_id: locationId,
                zone_id: zone.zone_id,
                camera_code: zone.camera_id,
                date: dayDate,
                trend: ['up', 'down', 'stable'][randomInt(0, 2)],
                performance: {
                    people_count: randomInt(10, 60),
                    total_sales_value: randomInt(50000, 300000),
                    total_events: randomInt(3, 20),
                    conversion_rate: randomInt(20, 60),
                    avg_dwell_time: randomInt(60, 600),
                    total_stop_events: randomInt(2, 15),
                    peak_hour: randomInt(9, 20)
                }
            });
        });

        // Sessions cho ngày này (lộ trình A/B để mining có đủ data)
        const dayPatterns = [
            { seq: [Z.e, Z.s, Z.c], count: randomInt(3, 6) },
            { seq: [Z.e, Z.p, Z.c], count: randomInt(2, 4) },
        ];
        dayPatterns.forEach(({ seq, count }) => {
            for (let i = 0; i < count; i++) {
                const base = randomInt(60, 480);
                sessionsBulk.push({
                    location_id: locationId,
                    session_uuid: `${locationId}_DAY${d}_${i}_${seq.join('')}_${daySuffix}`,
                    entry_time: new Date(dayDate.getTime() + base * 60 * 1000),
                    exit_time: new Date(dayDate.getTime() + (base + seq.length * 5) * 60 * 1000),
                    total_dwell_time_seconds: seq.length * 240,
                    zone_sequence: seq.map((zid, zi) => ({
                        zone_id: zid,
                        entry_time: new Date(dayDate.getTime() + (base + zi * 5) * 60 * 1000),
                        exit_time: new Date(dayDate.getTime() + (base + zi * 5 + 4) * 60 * 1000),
                        dwell_time_seconds: 240
                    }))
                });
            }
        });
    }

    await Promise.all([
        LocationStats.insertMany(locationStatsBulk),
        ZoneStats.insertMany(zoneStatsBulk),
        Session.insertMany(sessionsBulk),
    ]);
    console.log(`[seed] 7-day history: ${locationStatsBulk.length} LocationStats, ${zoneStatsBulk.length} ZoneStats, ${sessionsBulk.length} sessions`);

    await FlowPatterns.insertMany([
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [zones[1].zone_id],   // entrance
            consequent_zones: [zones[2].zone_id],   // sale
            support_score: 0.68,
            confidence_score: 0.80,
            lift_score: 1.85,
            support_count: null,
            sequence: null
        },
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [zones[2].zone_id],   // sale
            consequent_zones: [zones[0].zone_id],   // checkout
            support_score: 0.55,
            confidence_score: 0.72,
            lift_score: 1.60,
            support_count: null,
            sequence: null
        },
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'frequent_sequence',
            sequence: [zones[1].zone_id, zones[2].zone_id, zones[0].zone_id], // entrance→sale→checkout
            support_score: 0.36,
            support_count: 8,
            antecedent_zones: null,
            consequent_zones: null,
            confidence_score: null,
            lift_score: null
        },
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'sequential_rule',
            antecedent_zones: [zones[1].zone_id, zones[2].zone_id], // entrance→sale
            consequent_zones: [zones[0].zone_id],                   // →checkout
            support_score: 0.36,
            support_count: 8,
            confidence_score: 0.67,
            lift_score: null,
            sequence: null
        }
    ]);

    const configRules = await CustomerCareRule.insertMany([
        {
            location_id: locationId,
            category: 'retention',
            rule_id: `RETENTION_LOW_VISIT_${uniqueSuffix}`,
            rule_name: 'Low visitor retention alert',
            logic: {
                metric_name: 'total_visitors',
                operator: '<',
                threshold: 50,
                unit: 'visitors/day'
            },
            action: 'notify',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'zone',
            rule_id: `ZONE_LONG_DWELL_${uniqueSuffix}`,
            rule_name: 'Zone dwell time warning',
            logic: {
                metric_name: 'avg_dwell_time',
                operator: '>=',
                threshold: 30,
                unit: 'minutes'
            },
            action: 'review_zone_layout',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'revenue',
            rule_id: `REVENUE_UPSELL_${uniqueSuffix}`,
            rule_name: 'Revenue upsell opportunity',
            logic: {
                metric_name: 'avg_basket_value',
                operator: '<=',
                threshold: 25000000,
                unit: 'VND'
            },
            action: 'suggest_promotion',
            is_active: true
        }
    ]);

    const seededAccounts = await ensureTestAccounts({
        primaryLocationId: locationId,
        secondaryLocationId: secondaryLocation.location_code
    });

    // ── Customers — 3 loại hội viên để test UI/UX ─────────────────────────
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper tạo history entry đã hoàn thành (có check_in và check_out)
    const makeVisit = (daysAgo, locationId) => {
        const visitDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const checkIn  = new Date(visitDate.getTime() + 7 * 60 * 60 * 1000);    // 07:00
        const checkOut = new Date(visitDate.getTime() + 8.5 * 60 * 60 * 1000);  // 08:30
        return { date: visitDate, check_in: checkIn, check_out: checkOut, locationId };
    };

    // Tính số ngày từ đầu tháng đến hôm nay để tạo lịch sử trong tháng
    const daysIntoMonth = Math.max(Math.floor((now - monthStart) / (24 * 60 * 60 * 1000)), 1);

    // Helper tạo visit vào ngày cụ thể trong tháng hiện tại (dayOfMonth: 1-31)
    const makeVisitOnDay = (dayOfMonth, locationId) => {
        const visitDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth, 7, 0, 0);
        // Chỉ tạo nếu ngày đó đã qua (không tạo ngày tương lai)
        if (visitDate > now) return null;
        const checkOut = new Date(visitDate.getTime() + 1.5 * 60 * 60 * 1000); // +1.5h
        return { date: visitDate, check_in: visitDate, check_out: checkOut, locationId };
    };

    const customers = await Customer.insertMany([
        // ── Loại 1: Khách thường xuyên — tới đều trong tháng ──────────────
        {
            locationId,
            code: `KH_${uniqueSuffix}_001`,
            name: 'Nguyễn Văn An',
            phone: `090${uniqueSuffix}01`,
            birthday: new Date('1990-03-15'),
            joinDate: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            totalSessions: 55,
            lastVisit: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            note: 'Khách VIP, tập đều đặn',
            history: [
                // Tháng này: tới các ngày 1,3,5,7,9,11,13,15... (mỗi 2 ngày, bỏ ngày tương lai)
                ...[1,3,5,7,9,11,13,15,17,19,21,23,25,27,29].map(d => makeVisitOnDay(d, locationId)).filter(Boolean),
                // Tháng trước
                makeVisit(35, locationId),
                makeVisit(40, locationId),
                makeVisit(45, locationId),
            ]
        },

        // ── Loại 2: Khách tần suất thấp — 2-3 lần trong tháng ──────────────
        {
            locationId,
            code: `KH_${uniqueSuffix}_002`,
            name: 'Trần Thị Bình',
            phone: `091${uniqueSuffix}02`,
            birthday: new Date('1995-07-22'),
            joinDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            totalSessions: 18,
            lastVisit: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            note: 'Bận công việc, tập không đều',
            history: [
                // Tháng này: chỉ 2-3 lần
                ...[5, 12, 20].map(d => makeVisitOnDay(d, locationId)).filter(Boolean),
                // Tháng trước
                makeVisit(32, locationId),
                makeVisit(45, locationId),
                makeVisit(60, locationId),
            ]
        },

        // ── Loại 3: Chưa tới tháng này — toàn bộ history là tháng trước ────
        {
            locationId,
            code: `KH_${uniqueSuffix}_003`,
            name: 'Lê Minh Cường',
            phone: `092${uniqueSuffix}03`,
            birthday: new Date('1988-11-10'),
            joinDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
            totalSessions: 8,
            lastVisit: new Date(monthStart.getTime() - 5 * 24 * 60 * 60 * 1000),
            note: 'Chưa thấy tháng này, cần liên hệ',
            history: [
                // Không có visit nào trong tháng này
                makeVisit(daysIntoMonth + 5,  locationId),
                makeVisit(daysIntoMonth + 12, locationId),
                makeVisit(daysIntoMonth + 20, locationId),
                makeVisit(daysIntoMonth + 35, locationId),
            ]
        }
    ]);

    // ── CustomerCareRule — đầy đủ cho cả 3 category ───────────────────────
    // Xóa rule cũ từ configRules và tạo lại đầy đủ hơn
    await CustomerCareRule.deleteMany({ location_id: locationId });

    const fullRules = await CustomerCareRule.insertMany([
        // ── Retention rules ────────────────────────────────────────────────

        // KH_003 sẽ khớp: lastVisit > 30 ngày trước
        {
            location_id: locationId,
            category: 'retention',
            rule_id: `RETENTION_CHURN_${uniqueSuffix}`,
            rule_name: 'Khách chưa ghé hơn 30 ngày',
            logic: { metric_name: 'days_since_last_visit', operator: '>', threshold: 30, unit: 'ngày' },
            action: 'Liên hệ khách hàng để nhắc nhở quay lại',
            is_active: true
        },
        // KH_002 sẽ khớp: visits_last_30_days <= 3 (tần suất thấp)
        {
            location_id: locationId,
            category: 'retention',
            rule_id: `RETENTION_LOW_FREQ_${uniqueSuffix}`,
            rule_name: 'Khách tần suất thấp trong 30 ngày',
            logic: { metric_name: 'visits_last_30_days', operator: '<=', threshold: 3, unit: 'lần' },
            action: 'Gửi tin nhắn khuyến khích tập luyện đều đặn hơn',
            is_active: true
        },

        // ── Revenue rules ──────────────────────────────────────────────────

        // KH_001 sẽ khớp: totalSessions >= 50 (khách VIP)
        {
            location_id: locationId,
            category: 'revenue',
            rule_id: `REVENUE_VIP_${uniqueSuffix}`,
            rule_name: 'Khách VIP tần suất cao',
            logic: { metric_name: 'total_sessions', operator: '>=', threshold: 50, unit: 'lượt' },
            action: 'Tặng ưu đãi VIP cho khách hàng thân thiết',
            is_active: true
        },
        // KH_002 sẽ khớp: totalSessions >= 10 (khách trung thành)
        {
            location_id: locationId,
            category: 'revenue',
            rule_id: `REVENUE_LOYAL_${uniqueSuffix}`,
            rule_name: 'Khách trung thành (>= 10 lượt)',
            logic: { metric_name: 'total_sessions', operator: '>=', threshold: 10, unit: 'lượt' },
            action: 'Gửi lời cảm ơn và voucher giảm giá tháng tới',
            is_active: true
        },
        // Zone: dừng quá lâu tại quầy thanh toán (>= 30 giây)
        {
            location_id: locationId,
            category: 'zone',
            rule_id: `ZONE_CHECKOUT_DWELL_${uniqueSuffix}`,
            rule_name: 'Khách dừng quá lâu tại quầy thanh toán',
            logic: {
                metric_name: 'dwell_time',
                operator: '>=',
                threshold: 30,
                unit: 'giây'
            },
            zone_id: ZONE_IDS.checkout,
            action: 'Hỗ trợ khách tại quầy thanh toán ngay',
            is_active: true
        },
        // Zone: dừng quá lâu tại khu vực giảm giá (>= 60 giây)
        {
            location_id: locationId,
            category: 'zone',
            rule_id: `ZONE_SALE_DWELL_${uniqueSuffix}`,
            rule_name: 'Khách quan tâm khu vực giảm giá',
            logic: {
                metric_name: 'dwell_time',
                operator: '>=',
                threshold: 60,
                unit: 'giây'
            },
            zone_id: ZONE_IDS.sale,
            action: 'Tiếp cận tư vấn khách tại khu giảm giá',
            is_active: true
        }
    ]);

    // ── Notifications — NORMAL (retention/revenue) + ALERT (zone) ─────────
    const notifications = await Notification.insertMany([
        // NORMAL — retention
        {
            location_id: locationId,
            rule_id: fullRules[0].rule_id,
            type: 'RETENTION',
            title: 'NORMAL',
            message: `Liên hệ khách hàng để nhắc nhở quay lại | ${customers[0].name} (${customers[0].phone})`,
            is_read: false,
            created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 giờ trước
        },
        // NORMAL — revenue
        {
            location_id: locationId,
            rule_id: fullRules[1].rule_id,
            type: 'REVENUE',
            title: 'NORMAL',
            message: `Tặng ưu đãi VIP cho khách hàng thân thiết | ${customers[1].name} (${customers[1].phone})`,
            is_read: true,
            created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000) // 5 giờ trước
        },
        // ALERT — zone checkout
        {
            location_id: locationId,
            rule_id: fullRules[2].rule_id,
            type: 'ZONE',
            title: 'ALERT',
            message: `Hỗ trợ khách tại quầy thanh toán ngay | Khu vực: ${ZONE_IDS.checkout} | Thời gian dừng: 47.3s`,
            is_read: false,
            created_at: new Date(now.getTime() - 15 * 60 * 1000) // 15 phút trước
        },
        // ALERT — zone sale
        {
            location_id: locationId,
            rule_id: fullRules[3].rule_id,
            type: 'ZONE',
            title: 'ALERT',
            message: `Tiếp cận tư vấn khách tại khu giảm giá | Khu vực: ${ZONE_IDS.sale} | Thời gian dừng: 72.1s`,
            is_read: false,
            created_at: new Date(now.getTime() - 30 * 60 * 1000) // 30 phút trước
        },
        // ALERT — đã đọc (để test trạng thái đã đọc)
        {
            location_id: locationId,
            rule_id: fullRules[2].rule_id,
            type: 'ZONE',
            title: 'ALERT',
            message: `Hỗ trợ khách tại quầy thanh toán ngay | Khu vực: ${ZONE_IDS.checkout} | Thời gian dừng: 35.8s`,
            is_read: true,
            created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 giờ trước
        }
    ]);

    console.log('[seed] Done');
    console.log(`[seed] location_code=${locationId}`);
    console.log(`[seed] secondary_location_code=${secondaryLocation.location_code}`);
    console.log(`[seed] assets=${assets.length}, cameras=${cameras.length}, zones=${zones.length}`);
    console.log(`[seed] zone-camera mapping: ${zones.map((z) => `${z.zone_id}->${z.camera_id}`).join(', ')}`);
    console.log(`[seed] events=${businessEvents.length}, sessions=3`);
    console.log(`[seed] configRules=${fullRules.length} (retention=${fullRules.filter(r=>r.category==='retention').length}, revenue=${fullRules.filter(r=>r.category==='revenue').length}, zone=${fullRules.filter(r=>r.category==='zone').length})`);
    console.log(`[seed] customers=${customers.length} (churn candidate: ${customers[0].name}, VIP: ${customers[1].name})`);
    console.log(`[seed] notifications=${notifications.length} (NORMAL=${notifications.filter(n=>n.title==='NORMAL').length}, ALERT=${notifications.filter(n=>n.title==='ALERT').length})`);
    console.log('[seed] hourly traffic test queries:');
    console.log(`[seed] - /api/area-management/hourly-traffic?locationId=${locationId}&type=today`);
    console.log(`[seed] - /api/area-management/hourly-traffic?locationId=${locationId}&zoneId=${ZONE_IDS.checkout}&type=today`);
    console.log(`[seed] - /api/area-management/hourly-traffic?locationId=${locationId}&zoneId=${ZONE_IDS.entrance}&type=today`);
    console.log(`[seed] - /api/area-management/hourly-traffic?locationId=${locationId}&zoneId=${ZONE_IDS.sale}&type=today`);
    console.log(`[seed] - /api/area-management/hourly-traffic?locationId=${locationId}&zoneId=${ZONE_IDS.premium}&type=today`);

    const testUsers = await User.find({
        $or: [
            { location_id: locationId },
            { role: 'ADMIN_SUPER' }
        ]
    })
        .select('account role -_id')
        .sort({ role: 1, account: 1 })
        .lean();

    if (testUsers.length > 0) {
        console.log('[seed] test users (account - role - password):');
        testUsers.forEach((user) => {
            console.log(`[seed] - ${user.account} - ${user.role} - ${TEST_USER_PASSWORD}`);
        });
    } else {
        console.log('[seed] test users (account - role - password): empty. Please run user seed first.');
    }

    console.log(`[seed] manager test account: ${seededAccounts.manager.account} - ${seededAccounts.manager.role} - stores=${seededAccounts.manager.stores.join(', ')} - password=${TEST_USER_PASSWORD}`);
    console.log(`[seed] admin test account: ${seededAccounts.admin.account} - ${seededAccounts.admin.role} - stores=${seededAccounts.admin.stores.join(', ')} - password=${TEST_USER_PASSWORD}`);
}

seed()
    .catch((error) => {
        console.error('[seed] Failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });