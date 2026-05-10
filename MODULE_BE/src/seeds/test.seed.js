/**
 * test.seed.js — Seed tối giản để test luồng AI thực tế
 *
 * Chỉ tạo:
 *   - 1 Location (cửa hàng)
 *   - 2 Camera (front door + checkout)
 *   - 4 Zone (gắn với camera)
 *   - 1 User MANAGER gắn với location
 *
 * KHÔNG tạo: Session, InteractionLog, BusinessEvent,
 *             LocationStats, ZoneStats, Heatmap, FlowPatterns
 *
 * Dùng để test luồng AI phân tích thực tế từ đầu (clean slate).
 *
 * Chạy:
 *   node src/seeds/test.seed.js
 *   node src/seeds/test.seed.js --clean   (xóa data cũ của location trước khi seed)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Location      = require('../schemas/location.schema');
const Camera        = require('../schemas/camera.schema');
const Zone          = require('../schemas/zone.schema');
const User          = require('../schemas/user.schema');
const Session       = require('../schemas/session.schema');
const InteractionLog= require('../schemas/interactionLog.schema');
const LocationStats = require('../schemas/locationStats.schema');
const ZoneStats     = require('../schemas/zoneStats.schema');
const BusinessEvent = require('../schemas/businessEvent.schema');
const Heatmap       = require('../schemas/heatmap.schema');
const FlowPatterns  = require('../schemas/flowPatterns.schema');
const { hashPassword } = require('../middlewares/security.middleware');
const { getCurrnetDateVN } = require('../utils/date.util');

// ── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI      = process.env.URI_MONGODB || process.env.MONGO_URI;
const LOCATION_CODE  = (process.env.TEST_SEED_LOCATION_CODE || 'LOC_CLEAN_001').toUpperCase();
const USER_PASSWORD  = process.env.TEST_SEED_PASSWORD || 'test123456';
const SHOULD_CLEAN   = process.argv.includes('--clean');

const FRONT_CAM_CODE    = `CAM_FRONT_${LOCATION_CODE}`;
const CHECKOUT_CAM_CODE = `CAM_CHECKOUT_${LOCATION_CODE}`;

const ZONE_IDS = {
    entrance: `ZONE_ENTRANCE_${LOCATION_CODE}`,
    checkout: `ZONE_CHECKOUT_${LOCATION_CODE}`,
    sale:     `ZONE_SALE_${LOCATION_CODE}`,
    premium:  `ZONE_PREMIUM_${LOCATION_CODE}`,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
async function cleanLocation(locationId) {
    // Xóa tất cả dữ liệu AI và thống kê của location, cùng với Camera và Zone
    await Promise.all([
        Camera.deleteMany({ location_id: locationId }),
        Zone.deleteMany({ location_id: locationId }),
        Session.deleteMany({ location_id: locationId }),
        InteractionLog.deleteMany({ location_id: locationId }),
        LocationStats.deleteMany({ location_id: locationId }),
        ZoneStats.deleteMany({ location_id: locationId }),
        BusinessEvent.deleteMany({ location_id: locationId }),
        Heatmap.deleteMany({ location_id: locationId }),
        FlowPatterns.deleteMany({ location_id: locationId }),
    ]);
    console.log(`[test.seed] Cleaned all cameras, zones, and AI/stats data for ${locationId}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
    if (!MONGO_URI) {
        throw new Error('Missing MongoDB URI. Set URI_MONGODB in .env');
    }

    await mongoose.connect(MONGO_URI, { dbName: 'spacelens' });
    console.log('[test.seed] Connected to MongoDB');

    // ── 1. Location ───────────────────────────────────────────────────────────
    let location = await Location.findOne({ location_code: LOCATION_CODE });
    if (!location) {
        location = await Location.create({
            location_code: LOCATION_CODE,
            name:          'Test Store (Clean)',
            address:       '1 Test Street, District 1, HCMC',
            type_model:    'RETAIL',
            manager_info: {
                name:  'Test Manager',
                phone: '0900000001',
                email: `manager.${LOCATION_CODE.toLowerCase()}@test.local`,
            },
            business_hours: {
                open:     '08:00',
                close:    '22:00',
                timezone: 'Asia/Ho_Chi_Minh',
            },
        });
        console.log(`[test.seed] Created location: ${LOCATION_CODE}`);
    } else {
        console.log(`[test.seed] Location already exists: ${LOCATION_CODE}`);
    }

    const locationId = location.location_code;

    // ── 2. Clean nếu có flag --clean ──────────────────────────────────────────
    if (SHOULD_CLEAN) {
        await cleanLocation(locationId);
    }

    // ── 3. Cameras ────────────────────────────────────────────────────────────
    const cameraDocs = [
        {
            location_id:        locationId,
            camera_name:        'Front Door Camera',
            camera_code:        FRONT_CAM_CODE,
            rtsp_url:           'D:\\NCKH_2\\MODULE_AI\\storage\\videos\\video_1.mp4',
            url_image_snapshot: 'https://res.cloudinary.com/dospk2dnl/image/upload/v1765270843/uploads/s8jfq1zamsxmbaopoarm.png',
            status:             'inactive',
            installation_date:  getCurrnetDateVN(),
            camera_spec: {
                max_resolution:     { width: 1920, height: 1080 },
                current_resolution: { width: 1280, height: 720 },
            },
            camera_state: {
                last_processed_time: null,
                last_stop_time:      null,
            },
        },
        {
            location_id:        locationId,
            camera_name:        'Checkout Camera',
            camera_code:        CHECKOUT_CAM_CODE,
            rtsp_url:           'D:\\NCKH_2\\MODULE_AI\\storage\\videos\\video_2.mp4',
            url_image_snapshot: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
            status:             'inactive',
            installation_date:  getCurrnetDateVN(),
        },
    ];

    // Upsert — không tạo trùng nếu chạy lại
    const cameras = await Promise.all(
        cameraDocs.map((doc) =>
            Camera.findOneAndUpdate(
                { camera_code: doc.camera_code },
                { $setOnInsert: doc },
                { upsert: true, new: true }
            )
        )
    );

    const frontCam    = cameras.find((c) => c.camera_code === FRONT_CAM_CODE);
    const checkoutCam = cameras.find((c) => c.camera_code === CHECKOUT_CAM_CODE);
    console.log(`[test.seed] Cameras ready: ${FRONT_CAM_CODE}, ${CHECKOUT_CAM_CODE}`);

    // ── 4. Zones ──────────────────────────────────────────────────────────────
    // Tọa độ normalized [0-1] — AI sẽ scale theo frame size thực tế
    const zoneDocs = [
        {
            location_id:          locationId,
            camera_id:            frontCam.camera_code,
            zone_name:            'Lối vào chính',
            zone_id:              ZONE_IDS.entrance,
            category_name:        'Đồ uống',
            function_type:        'Main Entrance',
            polygon_coordinates:  [[0.40, 0.20], [0.70, 0.20], [0.70, 0.60], [0.40, 0.60]],
        },
        {
            location_id:          locationId,
            camera_id:            frontCam.camera_code,
            zone_name:            'Quầy thanh toán',
            zone_id:              ZONE_IDS.checkout,
            category_name:        'Thanh toán',
            function_type:        'Checkout Counter',
            polygon_coordinates:  [[0.05, 0.25], [0.35, 0.25], [0.35, 0.55], [0.05, 0.55]],
        },
        {
            location_id:          locationId,
            camera_id:            checkoutCam.camera_code,
            zone_name:            'Khu vực giảm giá',
            zone_id:              ZONE_IDS.sale,
            category_name:        'Bánh kẹo',
            function_type:        'Sale Area',
            polygon_coordinates:  [[0.05, 0.15], [0.55, 0.15], [0.55, 0.65], [0.05, 0.65]],
        },
        {
            location_id:          locationId,
            camera_id:            checkoutCam.camera_code,
            zone_name:            'Khu vực cao cấp',
            zone_id:              ZONE_IDS.premium,
            category_name:        'Gia dụng',
            function_type:        'Premium Products',
            polygon_coordinates:  [[0.60, 0.15], [0.95, 0.15], [0.95, 0.75], [0.60, 0.75]],
        },
    ];

    // Upsert theo zone_id
    await Promise.all(
        zoneDocs.map((doc) =>
            Zone.findOneAndUpdate(
                { zone_id: doc.zone_id },
                { $setOnInsert: doc },
                { upsert: true, new: true }
            )
        )
    );
    console.log(`[test.seed] Zones ready: ${Object.values(ZONE_IDS).join(', ')}`);

    // ── 5. User MANAGER ───────────────────────────────────────────────────────
    const hashedPassword = await hashPassword(USER_PASSWORD);
    const managerAccount = `manager_${LOCATION_CODE.toLowerCase()}`;

    await User.findOneAndUpdate(
        { account: managerAccount },
        {
            $set: {
                account:     managerAccount,
                password:    hashedPassword,
                email:       `${managerAccount}@test.local`,
                role:        'MANAGER',
                location_id: locationId,
            },
        },
        { upsert: true }
    );
    console.log(`[test.seed] User ready: ${managerAccount} / ${USER_PASSWORD}`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n[test.seed] ✅ Done — clean test environment ready');
    console.log('─────────────────────────────────────────────────');
    console.log(`  Location  : ${locationId}`);
    console.log(`  Cameras   : ${FRONT_CAM_CODE}, ${CHECKOUT_CAM_CODE}`);
    console.log(`  Zones     : ${Object.values(ZONE_IDS).join(', ')}`);
    console.log(`  Login     : ${managerAccount} / ${USER_PASSWORD}`);
    console.log('─────────────────────────────────────────────────');
    console.log('  No sessions, no business events, no stats data.');
    console.log('  Start AI camera to generate real data.\n');
}

seed()
    .catch((err) => {
        console.error('[test.seed] Fatal error:', err);
        process.exit(1);
    })
    .finally(() => mongoose.disconnect());
