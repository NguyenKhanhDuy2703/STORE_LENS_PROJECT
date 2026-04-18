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
const User = require('../schemas/user.schema');
const { hashPassword } = require('../middlewares/security.middleware');
const { dateUtil, getCurrnetDateVN } = require('../utils/date.util');

const MONGO_URI = process.env.URI_MONGODB || process.env.MONGO_URI;
const LOCATION_CODE = (process.env.SEED_LOCATION_CODE || 'LOC_TEST_001').toUpperCase();
const SECONDARY_LOCATION_CODE = (process.env.SEED_SECONDARY_LOCATION_CODE || 'LOC_TEST_002').toUpperCase();
const TEST_USER_PASSWORD = process.env.SEED_TEST_PASSWORD || '123456';
const FRONT_CAMERA_CODE = 'CAM_FRONT_057601';
const CHECKOUT_CAMERA_CODE = 'CAM_CHECKOUT_057601';
const SHOULD_CLEAN = process.argv.includes('--clean');

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

async function cleanupLocationData(locationId, zoneIds) {
    await Promise.all([
        Asset.deleteMany({ location_id: locationId }),
        Camera.deleteMany({ location_id: locationId }),
        Zone.deleteMany({ location_id: locationId }),
        Session.deleteMany({ location_id: locationId }),
        InteractionLog.deleteMany({ location_id: locationId }),
        BusinessEvent.deleteMany({ location_id: locationId }),
        LocationStats.deleteMany({ location_id: locationId }),
        ZoneStats.deleteMany({ location_id: locationId }),
        Heatmap.deleteMany({ location_id: locationId }),
        FlowPatterns.deleteMany({ location_id: locationId }),
        CustomerCareRule.deleteMany({ location_id: locationId })
    ]);

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
        await cleanupLocationData(locationId, existingZoneIds);
        console.log(`[seed] Cleaned old fake data for ${locationId}`);
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

    const cameras = await Camera.insertMany([
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
    ]);

    const cameraCodeByName = {
        frontDoor: cameras[0].camera_code,
        checkout: cameras[1].camera_code
    };

    const zones = await Zone.insertMany([
        {
            location_id: locationId,
            camera_id: cameraCodeByName.frontDoor,
            zone_name: 'Quầy thanh toán',
            zone_id: `ZONE_CHECKOUT_${uniqueSuffix}`,
            category_name: 'Thanh toán',
            function_type: 'Checkout Counter',
            polygon_coordinates: [[100, 120], [450, 120], [450, 400], [100, 400]]
        },
        {
            location_id: locationId,
            camera_id: cameraCodeByName.frontDoor,
            zone_name: 'Lối vào chính',
            zone_id: `ZONE_ENTRANCE_${uniqueSuffix}`,
            category_name: 'Đồ uống',
            function_type: 'Main Entrance',
            polygon_coordinates: [[500, 130], [880, 130], [880, 430], [500, 430]]
        },
        {
            location_id: locationId,
            camera_id: cameraCodeByName.checkout,
            zone_name: 'Khu vực giảm giá',
            zone_id: `ZONE_SALE_${uniqueSuffix}`,
            category_name: 'Bánh kẹo',
            function_type: 'Sale Area',
            polygon_coordinates: [[50, 80], [600, 80], [600, 360], [50, 360]]
        },
        {
            location_id: locationId,
            camera_id: cameraCodeByName.checkout,
            zone_name: 'Mỹ phẩm cao cấp',
            zone_id: `ZONE_PREMIUM_${uniqueSuffix}`,
            category_name: 'Gia dụng',
            function_type: 'Premium Products',
            polygon_coordinates: [[100, 100], [800, 100], [800, 500], [100, 500]]
        }
    ]);

    const sessionUuid1 = `${locationId}_${cameras[0]._id}_1001`;
    const sessionUuid2 = `${locationId}_${cameras[0]._id}_1002`;

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
            session_uuid: sessionUuid2,
            location_id: locationId,
            zone_id: zones[1].zone_id,
            asset_id: String(assets[1]._id),
            event_type: 'stop',
            start_time: new Date(today.getTime() + (10 * 60 + 6) * 60 * 1000),
            last_heartbeat: new Date(today.getTime() + (10 * 60 + 14) * 60 * 1000),
            duration_seconds: 480,
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
            discount: 1500000,
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
    const totalVisitors = 2;
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
            date: today,
            trend: 'up',
            performance: {
                people_count: 24,
                total_sales_value: assets[0].price,
                total_events: 12,
                conversion_rate: 50,
                avg_dwell_time: 28,
                total_stop_events: 8,
                top_asset_id: String(assets[0]._id),
                peak_hour: 10
            }
        },
        {
            location_id: locationId,
            zone_id: zones[1].zone_id,
            date: today,
            trend: 'stable',
            performance: {
                people_count: 20,
                total_sales_value: assets[1].price,
                total_events: 10,
                conversion_rate: 45,
                avg_dwell_time: 35,
                total_stop_events: 7,
                top_asset_id: String(assets[1]._id),
                peak_hour: 11
            }
        },
        {
            location_id: locationId,
            zone_id: zones[2].zone_id,
            date: today,
            trend: 'up',
            performance: {
                people_count: 18,
                total_sales_value: totalRevenue,
                total_events: 9,
                conversion_rate: 60,
                avg_dwell_time: 18,
                total_stop_events: 12,
                top_asset_id: String(assets[2]._id),
                peak_hour: 12
            }
        }
    ]);

    await Heatmap.insertMany([
        ...createHeatmapSeries({
            locationId,
            cameraId: cameras[0].camera_code,
            date: today,
            count: 6,
            intervalMs: 30 * 1000
        })
    ]);

    await FlowPatterns.insertMany([
        {
            location_id: locationId,
            pattern_type: 'SEQUENTIAL',
            antecedent_zones: [zones[0].zone_id],
            consequent_zones: [zones[2].zone_id],
            confidence_score: 0.68,
            support_score: 0.32,
            lift_score: 1.27
        },
        {
            location_id: locationId,
            pattern_type: 'SEQUENTIAL',
            antecedent_zones: [zones[1].zone_id],
            consequent_zones: [zones[2].zone_id],
            confidence_score: 0.61,
            support_score: 0.28,
            lift_score: 1.19
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

    console.log('[seed] Done');
    console.log(`[seed] location_code=${locationId}`);
    console.log(`[seed] secondary_location_code=${secondaryLocation.location_code}`);
    console.log(`[seed] assets=${assets.length}, cameras=${cameras.length}, zones=${zones.length}`);
    console.log(`[seed] zone-camera mapping: ${zones.map((z) => `${z.zone_id}->${z.camera_id}`).join(', ')}`);
    console.log(`[seed] events=${businessEvents.length}, sessions=2`);
    console.log(`[seed] configRules=${configRules.length}`);

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