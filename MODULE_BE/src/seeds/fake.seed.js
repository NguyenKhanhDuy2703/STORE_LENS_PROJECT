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

const MONGO_URI = process.env.URI_MONGODB || process.env.MONGO_URI;
const LOCATION_CODE = (process.env.SEED_LOCATION_CODE || 'LOC_TEST_001').toUpperCase();
const SHOULD_CLEAN = process.argv.includes('--clean');

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function vnStartOfDay(date = new Date()) {
    const offsetMs = 7 * 60 * 60 * 1000;
    const vnDate = new Date(date.getTime() + offsetMs);
    vnDate.setUTCHours(0, 0, 0, 0);
    return new Date(vnDate.getTime() - offsetMs);
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
        FlowPatterns.deleteMany({ location_id: locationId })
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

    const today = vnStartOfDay();
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

    const locationId = location.location_code;
    const existingZones = await Zone.find({ location_id: locationId }).select('zone_id').lean();
    const existingZoneIds = existingZones.map((z) => z.zone_id);

    if (SHOULD_CLEAN) {
        await cleanupLocationData(locationId, existingZoneIds);
        console.log(`[seed] Cleaned old fake data for ${locationId}`);
    }

    const uniqueSuffix = Date.now().toString().slice(-6);

    const assets = await Asset.insertMany([
        {
            location_id: locationId,
            category_name: 'Smartphone',
            name_product: `iPhone 15 Pro ${uniqueSuffix}`,
            brand: 'Apple',
            price: 29990000,
            unit: 'piece',
            stock_quantity: 35
        },
        {
            location_id: locationId,
            category_name: 'Laptop',
            name_product: `MacBook Air M3 ${uniqueSuffix}`,
            brand: 'Apple',
            price: 31990000,
            unit: 'piece',
            stock_quantity: 20
        },
        {
            location_id: locationId,
            category_name: 'Accessory',
            name_product: `AirPods Pro ${uniqueSuffix}`,
            brand: 'Apple',
            price: 5990000,
            unit: 'piece',
            stock_quantity: 90
        }
    ]);

    const cameras = await Camera.insertMany([
        {
            location_id: locationId,
            camera_name: 'Front Door Cam',
            camera_code: `CAM_FRONT_${uniqueSuffix}`,
            rtsp_url: 'rtsp://demo:demo@127.0.0.1:554/front',
            status: 'active',
            installation_date: new Date(),
            camera_spec: {
                max_resolution: { width: 1920, height: 1080 },
                current_resolution: { width: 1280, height: 720 }
            },
            camera_state: {
                last_processed_time: new Date(),
                last_stop_time: null
            }
        },
        {
            location_id: locationId,
            camera_name: 'Checkout Cam',
            camera_code: `CAM_CHECKOUT_${uniqueSuffix}`,
            rtsp_url: 'rtsp://demo:demo@127.0.0.1:554/checkout',
            status: 'active',
            installation_date: new Date()
        }
    ]);

    const zones = await Zone.insertMany([
        {
            location_id: locationId,
            camera_id: String(cameras[0]._id),
            zone_name: 'Smartphone Display',
            zone_id: `ZONE_PHONE_${uniqueSuffix}`,
            category_name: assets[0].category_name,
            function_type: 'Product Showcase',
            polygon_coordinates: [[100, 120], [450, 120], [450, 400], [100, 400]]
        },
        {
            location_id: locationId,
            camera_id: String(cameras[0]._id),
            zone_name: 'Laptop Shelf',
            zone_id: `ZONE_LAPTOP_${uniqueSuffix}`,
            category_name: assets[1].category_name,
            function_type: 'Product Showcase',
            polygon_coordinates: [[500, 130], [880, 130], [880, 430], [500, 430]]
        },
        {
            location_id: locationId,
            camera_id: String(cameras[1]._id),
            zone_name: 'Checkout Counter',
            zone_id: `ZONE_CHECKOUT_${uniqueSuffix}`,
            category_name: assets[2].category_name,
            function_type: 'Checkout',
            polygon_coordinates: [[50, 80], [600, 80], [600, 360], [50, 360]]
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
        {
            location_id: locationId,
            camera_id: String(cameras[0]._id),
            date: today,
            time_stamp: Date.now(),
            width_matrix: 8,
            height_matrix: 6,
            grid_size: 60,
            frame_width: 1280,
            frame_height: 720,
            heatmap_matrix: createHeatmapMatrix(6, 8)
        },
        {
            location_id: locationId,
            camera_id: String(cameras[1]._id),
            date: today,
            time_stamp: Date.now() + 1,
            width_matrix: 8,
            height_matrix: 6,
            grid_size: 60,
            frame_width: 1280,
            frame_height: 720,
            heatmap_matrix: createHeatmapMatrix(6, 8)
        }
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

    console.log('[seed] Done');
    console.log(`[seed] location_code=${locationId}`);
    console.log(`[seed] assets=${assets.length}, cameras=${cameras.length}, zones=${zones.length}`);
    console.log(`[seed] events=${businessEvents.length}, sessions=2`);
}

seed()
    .catch((error) => {
        console.error('[seed] Failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });