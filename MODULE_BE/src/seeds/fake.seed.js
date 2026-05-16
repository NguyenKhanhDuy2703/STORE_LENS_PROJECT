require('dotenv').config();
const mongoose = require('mongoose');

const Location = require('../schemas/location.schema');
const Camera = require('../schemas/camera.schema');
const Zone = require('../schemas/zone.schema');
const LocationStats = require('../schemas/locationStats.schema');
const ZoneStats = require('../schemas/zoneStats.schema');
const Heatmap = require('../schemas/heatmap.schema');
const FlowPatterns = require('../schemas/flowPatterns.schema');
const CustomerCareRule = require('../schemas/customerCareRule.schema');
const Notification = require('../schemas/notification.schema');
const Asset = require('../schemas/asset.schema');
const Customer = require('../schemas/customer.schema');
const Session = require('../schemas/session.schema');
const User = require('../schemas/user.schema');
const { hashPassword } = require('../middlewares/security.middleware');
const { dateUtil, getCurrnetDateVN } = require('../utils/date.util');

const MONGO_URI = process.env.URI_MONGODB || process.env.MONGO_URI;
const LOCATION_CODE = (process.env.SEED_LOCATION_CODE || 'SPACE_LENS_GYM_001').toUpperCase();
const TEST_USER_PASSWORD = process.env.SEED_TEST_PASSWORD || '123456';
const RECEPTION_CAMERA_CODE = 'CAM_RECEPTION_001';
const STUDIO_CAMERA_CODE = 'CAM_STUDIO_001';
const ZONE_IDS = {
    reception: 'ZONE_RECEPTION_DESK',
    cardio: 'ZONE_CARDIO_AREA',
    freeWeights: 'ZONE_FREE_WEIGHTS',
    yoga: 'ZONE_YOGA_ROOM',
    vippt: 'ZONE_VIP_PT',
    equipmentStorage: 'ZONE_EQUIPMENT_STORAGE'
};
const SHOULD_CLEAN = process.argv.includes('--clean');
const KEEP_LOCATION_CAMERA = process.argv.includes('--keep-location-camera');

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, digits = 2) {
    return Number((Math.random() * (max - min) + min).toFixed(digits));
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// Helper function to generate workout history for a customer
function generateWorkoutHistory({ locationId, pattern, startDate, endDate }) {
    const history = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // pattern: 'high' (5-6 days/week), 'medium' (3-4 days/week), 'low' (1-2 days/week), 'inactive' (0-1 days/month)
    const frequencies = {
        high: { min: 5, max: 6, morningChance: 0.6 },
        medium: { min: 3, max: 4, morningChance: 0.5 },
        low: { min: 1, max: 2, morningChance: 0.4 },
        inactive: { min: 0, max: 1, morningChance: 0.3 }
    };
    
    const freq = frequencies[pattern] || frequencies.medium;
    
    // Generate history month by month
    let currentDate = new Date(start);
    while (currentDate <= end) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const effectiveEnd = monthEnd > end ? end : monthEnd;
        
        // Determine sessions for this month
        const weeksInMonth = Math.ceil((effectiveEnd.getDate() - monthStart.getDate() + 1) / 7);
        const sessionsThisMonth = pattern === 'inactive' 
            ? randomInt(0, 2) 
            : randomInt(freq.min * weeksInMonth, freq.max * weeksInMonth);
        
        // Generate random days in the month
        const daysInMonth = effectiveEnd.getDate();
        const selectedDays = new Set();
        
        while (selectedDays.size < Math.min(sessionsThisMonth, daysInMonth)) {
            const day = randomInt(1, daysInMonth);
            selectedDays.add(day);
        }
        
        // Create history entries
        Array.from(selectedDays).sort((a, b) => a - b).forEach(day => {
            const sessionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            if (sessionDate >= start && sessionDate <= end) {
                const isMorning = Math.random() < freq.morningChance;
                const checkInHour = isMorning ? randomInt(6, 10) : randomInt(17, 20);
                const duration = randomFloat(1, 2.5); // 1-2.5 hours
                
                const checkIn = new Date(sessionDate);
                checkIn.setHours(checkInHour, randomInt(0, 59), 0, 0);
                
                const checkOut = new Date(checkIn);
                checkOut.setHours(checkIn.getHours() + Math.floor(duration), Math.floor((duration % 1) * 60), 0, 0);
                
                history.push({
                    date: sessionDate,
                    check_in: checkIn,
                    check_out: checkOut,
                    locationId
                });
            }
        });
        
        // Move to next month
        currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    return history;
}

function createHeatmapMatrix({ hotspot = false, width = 8, height = 6 }) {
    const matrix = [];
    for (let y = 0; y < height; y += 1) {
        const row = [];
        for (let x = 0; x < width; x += 1) {
            let value = randomInt(0, 4);
            if (hotspot && x >= Math.floor(width * 0.35) && x <= Math.floor(width * 0.75) && y >= Math.floor(height * 0.25) && y <= Math.floor(height * 0.65)) {
                value = randomInt(10, 15);
            }
            row.push(value);
        }
        matrix.push(row);
    }
    return matrix;
}

function createHourlyTraffic(zoneKey) {
    const base = {
        reception: 5,
        cardio: 12,
        freeWeights: 10,
        yoga: 7,
        vippt: 4,
        equipmentStorage: 1
    };
    const peakHours = {
        reception: [8, 18],
        cardio: [17, 20],
        freeWeights: [17, 20],
        yoga: [18, 19],
        vippt: [19],
        equipmentStorage: []
    };

    return Array.from({ length: 24 }).map((_, hour) => {
        let count = randomInt(Math.max(0, base[zoneKey] - 2), base[zoneKey] + 3);
        if (peakHours[zoneKey].includes(hour)) {
            count += randomInt(8, 18);
        }
        if (hour < 6 || hour > 21) {
            count = randomInt(0, 2);
        }
        return { hour: String(hour), count };
    });
}

function cleanupLocationData(locationId, options = {}) {
    const { keepLocationCamera = false } = options;
    const deleteTasks = [
        Asset.deleteMany({ location_id: locationId }),
        Customer.deleteMany({ locationId: locationId }),
        Zone.deleteMany({ location_id: locationId }),
        LocationStats.deleteMany({ location_id: locationId }),
        ZoneStats.deleteMany({ location_id: locationId }),
        Heatmap.deleteMany({ location_id: locationId }),
        FlowPatterns.deleteMany({ location_id: locationId }),
        CustomerCareRule.deleteMany({ location_id: locationId }),
        Notification.deleteMany({ location_id: locationId }),
        Session.deleteMany({ location_id: locationId })
    ];
    if (!keepLocationCamera) {
        deleteTasks.push(Camera.deleteMany({ location_id: locationId }));
    }
    return Promise.all(deleteTasks);
}

async function ensureTestAccounts({ primaryLocationId }) {
    const hashedPassword = await hashPassword(TEST_USER_PASSWORD);

    await User.updateOne(
        { account: 'gym_manager_1' },
        {
            $set: {
                account: 'gym_manager_1',
                password: hashedPassword,
                email: 'manager.fitness@spacelens.vn',
                role: 'MANAGER',
                location_id: primaryLocationId
            }
        },
        { upsert: true }
    );

    await User.updateOne(
        { account: 'gym_admin_1' },
        {
            $set: {
                account: 'gym_admin_1',
                password: hashedPassword,
                email: 'admin.fitness@spacelens.vn',
                role: 'ADMIN',
                location_id: primaryLocationId
            }
        },
        { upsert: true }
    );

    return {
        manager: { account: 'gym_manager_1', role: 'MANAGER', stores: [primaryLocationId] },
        admin: { account: 'gym_admin_1', role: 'ADMIN', stores: [primaryLocationId] }
    };
}

async function seed() {
    if (!MONGO_URI) {
        throw new Error('Missing MongoDB URI. Please set URI_MONGODB (or MONGO_URI) in .env');
    }

    await mongoose.connect(MONGO_URI, { dbName: 'spacelens' });
    console.log('[seed] Connected MongoDB');

    const { startDate: today } = dateUtil({ type: 'today' });
    const locationId = LOCATION_CODE;

    const location = await Location.findOneAndUpdate(
        { location_code: LOCATION_CODE },
        {
            location_code: LOCATION_CODE,
            name: 'SpaceLens Fitness Center',
            address: '123 Fitness Avenue, District 7, HCMC',
            type_model: 'GYM',
            manager_info: {
                name: 'Trần Minh Hiếu',
                phone: '0901234567',
                email: 'manager.fitness@spacelens.vn'
            },
            business_hours: {
                open: '06:00',
                close: '22:00',
                timezone: 'Asia/Ho_Chi_Minh'
            }
        },
        { upsert: true, new: true }
    );

    if (SHOULD_CLEAN) {
        await cleanupLocationData(locationId, { keepLocationCamera: KEEP_LOCATION_CAMERA });
        console.log(`[seed] Cleaned fake gym data for ${locationId}`);
        if (KEEP_LOCATION_CAMERA) {
            console.log('[seed] Keep mode: preserved location/camera data');
        }
    }

    const cameras = KEEP_LOCATION_CAMERA
        ? await Camera.find({ location_id: locationId, camera_code: { $in: [RECEPTION_CAMERA_CODE, STUDIO_CAMERA_CODE] } }).lean()
        : await Camera.insertMany([
            {
                location_id: locationId,
                camera_name: 'Reception Desk Cam',
                camera_code: RECEPTION_CAMERA_CODE,
                rtsp_url: 'D:\\NCKH_2\\MODULE_AI\\storage\\videos\\video_3.mp4',
                url_image_snapshot: 'https://res.cloudinary.com/dospk2dnl/image/upload/v1778688223/spacelens/zones/zone_1778688215793.jpg',
                status: 'active',
                installation_date: getCurrnetDateVN()
            },
            {
                location_id: locationId,
                camera_name: 'Studio Cam',
                camera_code: STUDIO_CAMERA_CODE,
                rtsp_url: 'D:\\NCKH_2\\MODULE_AI\\storage\\videos\\video_4.mp4',
                url_image_snapshot: 'https://res.cloudinary.com/dospk2dnl/image/upload/v1778688223/spacelens/zones/zone_1778688215793.jpg',
                status: 'active',
                installation_date: getCurrnetDateVN()
            }
        ]);

    const receptionCamera = cameras.find((c) => c.camera_code === RECEPTION_CAMERA_CODE);
    const studioCamera = cameras.find((c) => c.camera_code === STUDIO_CAMERA_CODE);

    if (!receptionCamera || !studioCamera) {
        throw new Error('Failed to initialize gym cameras for seed data');
    }
    const zones = await Zone.insertMany([
        {
            location_id: locationId,
            camera_id: receptionCamera.camera_code,
            zone_name: 'Quầy tiếp tân',
            zone_id: ZONE_IDS.reception,
            category_name: 'Reception',
            polygon_coordinates: [
                [0.02, 0.04], [0.44, 0.04], [0.44, 0.52], [0.02, 0.52]
            ]
        },
        {
            location_id: locationId,
            camera_id: studioCamera.camera_code,
            zone_name: 'Khu vực Cardio',
            zone_id: ZONE_IDS.cardio,
            category_name: 'Cardio',
            polygon_coordinates: [
                [0.609756, 0.320346], [0.967073, 0.430736],
                [0.841463, 0.997835], [0.181707, 0.991342]
            ]
        },
        {
            location_id: locationId,
            camera_id: studioCamera.camera_code,
            zone_name: 'Khu vực Tạ tự do',
            zone_id: ZONE_IDS.freeWeights,
            category_name: 'Free Weights',
            polygon_coordinates: [
                [0.59878, 0.307359], [0.220732, 0.049784],
                [0.00122, 0.209957], [0.403659, 0.603896]
            ]
        },
        {
            location_id: locationId,
            camera_id: studioCamera.camera_code,
            zone_name: 'Phòng Yoga/GroupX',
            zone_id: ZONE_IDS.yoga,
            category_name: 'Yoga',
            polygon_coordinates: [
                [0.004878, 0.235931], [0.371951, 0.65368],
                [0.147561, 0.997835], [0.00122, 0.991342]
            ]
        },
        {
            location_id: locationId,
            camera_id: receptionCamera.camera_code,
            zone_name: 'Khu vực VIP/PT',
            zone_id: ZONE_IDS.vippt,
            category_name: 'VIP/PT',
            // Góc phải trên — khu tập cá nhân với HLV, thiết bị cao cấp
            polygon_coordinates: [
                [0.56, 0.03], [0.97, 0.03], [0.97, 0.48], [0.56, 0.48]
            ]
        },
        {
            location_id: locationId,
            camera_id: receptionCamera.camera_code,
            zone_name: 'Kho thiết bị',
            zone_id: ZONE_IDS.equipmentStorage,
            category_name: 'Restricted',
            // Góc phải dưới — khu vực hạn chế, chỉ nhân viên
            polygon_coordinates: [
                [0.62, 0.55], [0.97, 0.55], [0.97, 0.97], [0.62, 0.97]
            ]
        }
    ]);

    const assets = await Asset.insertMany([
        // ── GÓI TẬP (Membership Packages) ──────────────────────────────────────
        {
            location_id: locationId,
            product_id: 'GYM_PKG_001',
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
            product_id: 'GYM_PKG_002',
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
            product_id: 'GYM_PKG_003',
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
            product_id: 'GYM_PKG_004',
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
            product_id: 'GYM_PKG_005',
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
            product_id: 'GYM_SUP_001',
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
            product_id: 'GYM_SUP_002',
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
            product_id: 'GYM_SUP_003',
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
            product_id: 'GYM_SUP_004',
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
            product_id: 'GYM_SUP_005',
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
            product_id: 'GYM_SUP_006',
            category_name: 'Supplement',
            name_product: 'Mass Gainer Serious Mass 6lb',
            zone_name: 'Quầy tiếp tân',
            brand: 'Optimum Nutrition',
            price: 1250000,
            unit: 'hộp',
            stock_quantity: 15,
            status: true,
            asset_attributes: { custom_note: '50g protein, 250g carbs/serving, tăng cân hiệu quả' }
        }
    ]);

    // Generate detailed workout history for customers
    const yearStart = new Date(2026, 0, 1); // Jan 1, 2026
    const now = new Date();
    
    const customers = await Customer.insertMany([
        { 
            locationId, code: 'GYM_MEM_001', name: 'Nguyễn Văn Nam', phone: '0901234001', 
            birthday: new Date('1992-06-12'), joinDate: new Date('2025-09-01'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Cardio', 'Legs'], 
            note: 'Hội viên VIP, thường xuyên giờ cao điểm', 
            history: generateWorkoutHistory({ locationId, pattern: 'high', startDate: yearStart, endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_002', name: 'Trần Thị Hồng', phone: '0901234002', 
            birthday: new Date('1997-02-28'), joinDate: new Date('2026-01-18'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Yoga', 'Core'], 
            note: 'Tham gia lớp Yoga buổi chiều', 
            history: generateWorkoutHistory({ locationId, pattern: 'medium', startDate: new Date('2026-01-18'), endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_003', name: 'Lê Minh Hoàng', phone: '0901234003', 
            birthday: new Date('1988-11-10'), joinDate: new Date('2025-11-05'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Strength', 'Back'], 
            note: 'Tham gia phòng VIP/PT cuối tuần', 
            history: generateWorkoutHistory({ locationId, pattern: 'low', startDate: yearStart, endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_004', name: 'Phạm Thị Lan', phone: '0901234004', 
            birthday: new Date('1995-03-15'), joinDate: new Date('2025-10-20'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Yoga', 'Flexibility'], 
            note: 'Hội viên chăm chỉ, đến đúng giờ', 
            history: generateWorkoutHistory({ locationId, pattern: 'high', startDate: yearStart, endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_005', name: 'Đỗ Quang Hùng', phone: '0901234005', 
            birthday: new Date('1990-07-22'), joinDate: new Date('2025-08-15'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Chest', 'Shoulders', 'Triceps'], 
            note: 'Tập nặng, thường ở khu tạ', 
            history: generateWorkoutHistory({ locationId, pattern: 'high', startDate: yearStart, endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_006', name: 'Nguyễn Thị Mai', phone: '0901234006', 
            birthday: new Date('2000-01-05'), joinDate: new Date('2026-02-01'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Cardio', 'Core'], 
            note: 'Hội viên mới, đang xây dựng thói quen', 
            history: generateWorkoutHistory({ locationId, pattern: 'medium', startDate: new Date('2026-02-01'), endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_007', name: 'Trần Văn Bình', phone: '0901234007', 
            birthday: new Date('1985-09-30'), joinDate: new Date('2025-06-01'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Back', 'Biceps', 'Legs'], 
            note: 'HLV nội bộ kiêm hội viên VIP 12 tháng', 
            history: generateWorkoutHistory({ locationId, pattern: 'high', startDate: yearStart, endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_008', name: 'Vũ Thị Thanh', phone: '0901234008', 
            birthday: new Date('1998-12-18'), joinDate: new Date('2026-03-10'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Yoga'], 
            note: 'Học viên lớp Yoga sáng thứ 3-5', 
            history: generateWorkoutHistory({ locationId, pattern: 'medium', startDate: new Date('2026-03-10'), endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_009', name: 'Bùi Đức Thịnh', phone: '0901234009', 
            birthday: new Date('1993-04-07'), joinDate: new Date('2025-12-01'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Cardio', 'Full Body'], 
            note: 'Tập buổi sáng sớm, đặt lịch PT 2 lần/tuần', 
            history: generateWorkoutHistory({ locationId, pattern: 'medium', startDate: yearStart, endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_010', name: 'Hoàng Thị Yến', phone: '0901234010', 
            birthday: new Date('1994-08-25'), joinDate: new Date('2026-01-05'), status: 'ACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Glutes', 'Legs', 'Core'], 
            note: 'Quan tâm gói PT, đã hỏi giá', 
            history: generateWorkoutHistory({ locationId, pattern: 'medium', startDate: new Date('2026-01-05'), endDate: now })
        },
        { 
            locationId, code: 'GYM_MEM_011', name: 'Lý Văn Tùng', phone: '0901234011', 
            birthday: new Date('1987-05-14'), joinDate: new Date('2025-07-20'), status: 'INACTIVE', 
            totalSessions: 0, lastVisit: null, 
            favoriteMuscleGroups: ['Strength'], 
            note: 'Chưa gia hạn gói tập, cần chăm sóc', 
            history: generateWorkoutHistory({ locationId, pattern: 'inactive', startDate: yearStart, endDate: new Date(now.getTime() - 45 * 864e5) })
        },
        { locationId, code: 'GYM_MEM_012', name: 'Đinh Thị Thu', phone: '0901234012', birthday: new Date('1999-11-03'), joinDate: new Date('2025-10-01'), status: 'INACTIVE', totalSessions: 12, lastVisit: new Date(today.getTime() - 60 * 864e5), favoriteMuscleGroups: ['Yoga', 'Core'], note: 'Không tái tục, cần gửi ưu đãi kéo lại', history: [{ date: new Date(today.getTime() - 60 * 864e5), check_in: new Date(today.getTime() - 60 * 864e5 + 9 * 3600e3), check_out: new Date(today.getTime() - 60 * 864e5 + 10.5 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_013', name: 'Phan Minh Tuấn', phone: '0901234013', birthday: new Date('1991-02-19'), joinDate: new Date('2026-02-14'), status: 'ACTIVE', totalSessions: 20, lastVisit: new Date(today.getTime() - 2 * 864e5), favoriteMuscleGroups: ['Chest', 'Abs'], note: 'Đang dùng gói 3 tháng tiêu chuẩn', history: [{ date: new Date(today.getTime() - 2 * 864e5), check_in: new Date(today.getTime() - 2 * 864e5 + 20 * 3600e3), check_out: new Date(today.getTime() - 2 * 864e5 + 22 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_014', name: 'Ngô Thị Bích', phone: '0901234014', birthday: new Date('1996-06-01'), joinDate: new Date('2025-09-15'), status: 'ACTIVE', totalSessions: 61, lastVisit: new Date(today.getTime() - 1 * 864e5), favoriteMuscleGroups: ['Cardio', 'Legs', 'Glutes'], note: 'Gói VIP 12 tháng, hay mua protein tại quầy', history: [{ date: new Date(today.getTime() - 864e5), check_in: new Date(today.getTime() - 864e5 + 16 * 3600e3), check_out: new Date(today.getTime() - 864e5 + 18 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_015', name: 'Trương Đình Khải', phone: '0901234015', birthday: new Date('1983-10-27'), joinDate: new Date('2025-05-01'), status: 'ACTIVE', totalSessions: 188, lastVisit: new Date(today.getTime() - 864e5), favoriteMuscleGroups: ['Full Body', 'Strength', 'Back'], note: 'Hội viên lâu năm, đánh giá cao dịch vụ', history: [{ date: new Date(today.getTime() - 864e5), check_in: new Date(today.getTime() - 864e5 + 5 * 3600e3), check_out: new Date(today.getTime() - 864e5 + 7 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_016', name: 'Lê Thị Phương', phone: '0901234016', birthday: new Date('2001-03-12'), joinDate: new Date('2026-04-01'), status: 'ACTIVE', totalSessions: 5, lastVisit: new Date(today.getTime() - 864e5), favoriteMuscleGroups: ['Yoga'], note: 'Hội viên mới nhất, đang trong tuần đầu', history: [{ date: new Date(today.getTime() - 864e5), check_in: new Date(today.getTime() - 864e5 + 8 * 3600e3), check_out: new Date(today.getTime() - 864e5 + 9 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_017', name: 'Hồ Văn Dũng', phone: '0901234017', birthday: new Date('1989-01-08'), joinDate: new Date('2025-11-20'), status: 'ACTIVE', totalSessions: 47, lastVisit: new Date(today.getTime() - 3 * 864e5), favoriteMuscleGroups: ['Shoulders', 'Arms', 'Chest'], note: 'Thường xuyên hỏi HLV về kỹ thuật', history: [{ date: new Date(today.getTime() - 3 * 864e5), check_in: new Date(today.getTime() - 3 * 864e5 + 18 * 3600e3), check_out: new Date(today.getTime() - 3 * 864e5 + 20 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_018', name: 'Dương Thị Ngọc', phone: '0901234018', birthday: new Date('1995-07-16'), joinDate: new Date('2026-01-10'), status: 'ACTIVE', totalSessions: 28, lastVisit: new Date(today.getTime() - 4 * 864e5), favoriteMuscleGroups: ['Core', 'Glutes', 'Flexibility'], note: 'Kết hợp Yoga và tạ nhẹ', history: [{ date: new Date(today.getTime() - 4 * 864e5), check_in: new Date(today.getTime() - 4 * 864e5 + 9 * 3600e3), check_out: new Date(today.getTime() - 4 * 864e5 + 11 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_019', name: 'Mai Xuân Hòa', phone: '0901234019', birthday: new Date('1986-12-04'), joinDate: new Date('2025-08-01'), status: 'INACTIVE', totalSessions: 22, lastVisit: new Date(today.getTime() - 90 * 864e5), favoriteMuscleGroups: ['Cardio'], note: 'Đã nghỉ dài, lý do công việc bận rộn', history: [{ date: new Date(today.getTime() - 90 * 864e5), check_in: new Date(today.getTime() - 90 * 864e5 + 7 * 3600e3), check_out: new Date(today.getTime() - 90 * 864e5 + 8.5 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_020', name: 'Lưu Thị Trang', phone: '0901234020', birthday: new Date('1993-09-20'), joinDate: new Date('2026-03-01'), status: 'ACTIVE', totalSessions: 12, lastVisit: new Date(today.getTime() - 2 * 864e5), favoriteMuscleGroups: ['Yoga', 'Core', 'Glutes'], note: 'Đang cân nhắc gói PT', history: [{ date: new Date(today.getTime() - 2 * 864e5), check_in: new Date(today.getTime() - 2 * 864e5 + 18 * 3600e3), check_out: new Date(today.getTime() - 2 * 864e5 + 19.5 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_021', name: 'Trịnh Văn Phú', phone: '0901234021', birthday: new Date('1990-04-11'), joinDate: new Date('2025-10-10'), status: 'ACTIVE', totalSessions: 66, lastVisit: new Date(today.getTime() - 864e5), favoriteMuscleGroups: ['Legs', 'Back', 'Full Body'], note: 'Tập 5 ngày/tuần, mục tiêu marathon', history: [{ date: new Date(today.getTime() - 864e5), check_in: new Date(today.getTime() - 864e5 + 5.5 * 3600e3), check_out: new Date(today.getTime() - 864e5 + 8 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_022', name: 'Nguyễn Bảo Châu', phone: '0901234022', birthday: new Date('2002-08-09'), joinDate: new Date('2026-04-15'), status: 'ACTIVE', totalSessions: 3, lastVisit: new Date(today.getTime() - 2 * 864e5), favoriteMuscleGroups: ['Core'], note: 'Sinh viên, đăng ký gói 1 tháng', history: [{ date: new Date(today.getTime() - 2 * 864e5), check_in: new Date(today.getTime() - 2 * 864e5 + 10 * 3600e3), check_out: new Date(today.getTime() - 2 * 864e5 + 11 * 3600e3), locationId }] },
        { locationId, code: 'GYM_MEM_023', name: 'Cao Thị Minh', phone: '0901234023', birthday: new Date('1984-06-30'), joinDate: new Date('2025-07-01'), status: 'ACTIVE', totalSessions: 130, lastVisit: new Date(today.getTime() - 1 * 864e5), favoriteMuscleGroups: ['Full Body', 'Strength', 'Cardio'], note: 'Hội viên trung thành, giới thiệu 3 bạn vào tập', history: [{ date: new Date(today.getTime() - 864e5), check_in: new Date(today.getTime() - 864e5 + 6 * 3600e3), check_out: new Date(today.getTime() - 864e5 + 8 * 3600e3), locationId }] }
    ]);


    const zoneByKey = zones.reduce((map, zone) => {
        map[zone.zone_id] = zone;
        return map;
    }, {});

    const locationStatsBulk = [];
    const zoneStatsBulk = [];
    const heatmapBulk = [];

    // Tạo dữ liệu cho tháng 3 và tháng 4 năm 2026
    const historicalDates = [];
    // Tháng 3/2026: 31 ngày
    for (let d = 1; d <= 31; d++) {
        historicalDates.push(startOfDay(new Date(2026, 2, d))); // month 2 = March
    }
    // Tháng 4/2026: 30 ngày
    for (let d = 1; d <= 30; d++) {
        historicalDates.push(startOfDay(new Date(2026, 3, d))); // month 3 = April
    }
    // 14 ngày gần nhất (bao gồm hôm nay)
    for (let dayOffset = 13; dayOffset >= 0; dayOffset -= 1) {
        historicalDates.push(startOfDay(new Date(today.getTime() - dayOffset * 24 * 60 * 60 * 1000)));
    }

    for (const date of historicalDates) {
        const visitors = randomInt(150, 300);
        const conversation = randomFloat(5, 10);
        const revenue = randomInt(1200000, 4200000);
        const events = randomInt(8, 20);

        locationStatsBulk.push({
            location_id: locationId,
            date,
            kpis: {
                total_visitors: visitors,
                total_revenue: revenue,
                total_events: events,
                conversion_rate: conversation,
                avg_store_dwell_time: randomInt(2400, 3600),
                avg_basket_value: Number((revenue / events).toFixed(2))
            },
            realtime: {
                people_current: randomInt(15, 32),
                checkout_length: randomInt(0, 8),
                zone_counts: {
                    [ZONE_IDS.reception]: randomInt(5, 12),
                    [ZONE_IDS.cardio]: randomInt(10, 28),
                    [ZONE_IDS.freeWeights]: randomInt(8, 24)
                }
            },
            chart_data: Array.from({ length: 24 }).map((_, hour) => ({
                hour,
                people_count: hour >= 6 && hour <= 22 ? randomInt(0, 22) : 0,
                total_revenue: hour >= 6 && hour <= 22 ? randomInt(0, 250000) : 0
            }))
        });

        zones.forEach((zone) => {
            const key = Object.keys(ZONE_IDS).find((k) => ZONE_IDS[k] === zone.zone_id);
            let basePeople = 12;
            let avgDwell = 180;
            let trend = 'stable';
            let totalSales = 0;
            let conversionRate = randomFloat(3, 8);

            if (key === 'cardio') {
                basePeople = randomInt(28, 42);
                avgDwell = randomInt(420, 720);
                trend = 'up';
                conversionRate = randomFloat(8, 12);
                totalSales = randomInt(0, 500000);
            }
            if (key === 'freeWeights') {
                basePeople = randomInt(24, 38);
                avgDwell = randomInt(600, 900);
                trend = 'up';
                totalSales = randomInt(0, 350000);
            }
            if (key === 'yoga') {
                basePeople = randomInt(10, 18);
                avgDwell = randomInt(3300, 3800);
                trend = 'stable';
                conversionRate = randomFloat(6, 10);
                totalSales = randomInt(0, 120000);
            }
            if (key === 'vippt') {
                basePeople = randomInt(8, 16);
                avgDwell = randomInt(900, 1200);
                trend = 'stable';
                conversionRate = randomFloat(7, 11);
                totalSales = randomInt(0, 220000);
            }
            if (key === 'reception') {
                basePeople = randomInt(18, 26);
                avgDwell = randomInt(120, 240);
                trend = 'stable';
                totalSales = randomInt(0, 150000);
            }
            if (key === 'equipmentStorage') {
                basePeople = randomInt(0, 2);
                avgDwell = randomInt(30, 60);
                trend = 'stable';
                totalSales = 0;
            }

            zoneStatsBulk.push({
                location_id: locationId,
                zone_id: zone.zone_id,
                camera_code: zone.camera_id,
                date,
                trend,
                performance: {
                    people_count: basePeople,
                    total_sales_value: totalSales,
                    total_events: randomInt(1, 8),
                    conversion_rate: conversionRate,
                    avg_dwell_time: avgDwell,
                    total_stop_events: randomInt(1, 8),
                    top_asset_id: null,
                    peak_hour: key === 'cardio' ? 18 : key === 'freeWeights' ? 18 : key === 'yoga' ? 19 : 17
                },
                hourly_traffic: createHourlyTraffic(key)
            });
        });

        heatmapBulk.push(
            {
                location_id: locationId,
                camera_id: studioCamera.camera_code,
                date,
                time_stamp: date.getTime() + 6 * 60 * 60 * 1000,
                width_matrix: 8,
                height_matrix: 6,
                grid_size: 60,
                frame_width: 1280,
                frame_height: 720,
                heatmap_matrix: createHeatmapMatrix({ hotspot: true })
            },
            {
                location_id: locationId,
                camera_id: receptionCamera.camera_code,
                date,
                time_stamp: date.getTime() + 7 * 60 * 60 * 1000,
                width_matrix: 8,
                height_matrix: 6,
                grid_size: 60,
                frame_width: 1280,
                frame_height: 720,
                heatmap_matrix: createHeatmapMatrix({ hotspot: false })
            }
        );
    }

    await Promise.all([
        LocationStats.insertMany(locationStatsBulk),
        ZoneStats.insertMany(zoneStatsBulk),
        Heatmap.insertMany(heatmapBulk)
    ]);

    // ── SESSION DATA (cho phân tích FP-Growth / PrefixSpan) ────────────────
    const sessionsBulk = [];
    const SESSION_TEMPLATES = [
        { seq: [ZONE_IDS.reception, ZONE_IDS.cardio, ZONE_IDS.freeWeights], dwells: [120, 1800, 2400] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.freeWeights, ZONE_IDS.vippt, ZONE_IDS.reception], dwells: [90, 3000, 1200, 60] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.yoga, ZONE_IDS.vippt], dwells: [120, 3600, 900] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.cardio], dwells: [150, 2700] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.freeWeights], dwells: [90, 3300] },
        { seq: [ZONE_IDS.cardio, ZONE_IDS.freeWeights], dwells: [1800, 2400] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.yoga, ZONE_IDS.reception], dwells: [120, 3600, 60] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.vippt, ZONE_IDS.reception], dwells: [90, 1800, 90] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.cardio, ZONE_IDS.vippt], dwells: [120, 2400, 1200] },
        { seq: [ZONE_IDS.reception, ZONE_IDS.freeWeights, ZONE_IDS.reception], dwells: [90, 3000, 60] }
    ];
    for (let i = 0; i < 30; i++) {
        const tmpl = SESSION_TEMPLATES[i % SESSION_TEMPLATES.length];
        const dayOffset = randomInt(0, 13);
        const entryHour = randomInt(6, 20);
        const baseTime = new Date(today.getTime() - dayOffset * 864e5 + entryHour * 3600e3);
        let cursor = new Date(baseTime);
        const zoneSeq = tmpl.seq.map((zone_id, idx) => {
            const entry_time = new Date(cursor);
            const dwell = tmpl.dwells[idx] + randomInt(-60, 60);
            cursor = new Date(cursor.getTime() + dwell * 1000);
            return { zone_id, entry_time, exit_time: new Date(cursor), dwell_time_seconds: dwell };
        });
        const totalDwell = tmpl.dwells.reduce((s, d) => s + d, 0);
        sessionsBulk.push({
            location_id: locationId,
            session_uuid: `SESS_${locationId}_${String(i + 1).padStart(3, '0')}`,
            person_id: `P${String(randomInt(1, 20)).padStart(3, '0')}`,
            reid_vector: [],
            entry_time: baseTime,
            exit_time: new Date(cursor),
            total_dwell_time_seconds: totalDwell,
            zone_sequence: zoneSeq
        });
    }
    await Session.insertMany(sessionsBulk);

    await FlowPatterns.insertMany([
        // ── FP-GROWTH: Association Rules ──────────────────────────────────────
        // Khách vào tiếp tân → thường đến khu cardio
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [ZONE_IDS.reception],
            consequent_zones: [ZONE_IDS.cardio],
            support_score: 0.72,
            support_count: 54,
            confidence_score: 0.82,
            lift_score: 1.6,
            sequence: null
        },
        // Khách vào tiếp tân → thường đến khu tạ tự do
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [ZONE_IDS.reception],
            consequent_zones: [ZONE_IDS.freeWeights],
            support_score: 0.58,
            support_count: 43,
            confidence_score: 0.66,
            lift_score: 1.4,
            sequence: null
        },
        // Khách tập cardio → thường đến tạ tự do (warm-up → main workout)
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [ZONE_IDS.cardio],
            consequent_zones: [ZONE_IDS.freeWeights],
            support_score: 0.55,
            support_count: 41,
            confidence_score: 0.71,
            lift_score: 1.5,
            sequence: null
        },
        // Khách ở khu tạ tự do → thường ghé khu VIP/PT (tìm HLV)
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [ZONE_IDS.freeWeights],
            consequent_zones: [ZONE_IDS.vippt],
            support_score: 0.42,
            support_count: 31,
            confidence_score: 0.54,
            lift_score: 1.35,
            sequence: null
        },
        // Khách khu VIP/PT → thường quay lại tiếp tân (đặt lịch, thanh toán)
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [ZONE_IDS.vippt],
            consequent_zones: [ZONE_IDS.reception],
            support_score: 0.65,
            support_count: 49,
            confidence_score: 0.78,
            lift_score: 1.3,
            sequence: null
        },
        // Khách tập Yoga → thường ghé khu VIP/PT (nhóm quan tâm wellness)
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [ZONE_IDS.yoga],
            consequent_zones: [ZONE_IDS.vippt],
            support_score: 0.38,
            support_count: 28,
            confidence_score: 0.61,
            lift_score: 1.55,
            sequence: null
        },
        // Cardio + Tạ tự do → VIP/PT (tập kết hợp → tìm HLV cá nhân)
        {
            location_id: locationId,
            algorithm: 'fpgrowth',
            pattern_type: 'association_rule',
            antecedent_zones: [ZONE_IDS.cardio, ZONE_IDS.freeWeights],
            consequent_zones: [ZONE_IDS.vippt],
            support_score: 0.35,
            support_count: 26,
            confidence_score: 0.58,
            lift_score: 1.48,
            sequence: null
        },

        // ── PREFIXSPAN: Frequent Sequences (chuỗi di chuyển phổ biến) ──────────
        // Hành trình phổ biến nhất: Tiếp tân → Cardio → Tạ tự do
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'frequent_sequence',
            antecedent_zones: null,
            consequent_zones: null,
            sequence: [ZONE_IDS.reception, ZONE_IDS.cardio, ZONE_IDS.freeWeights],
            support_score: 0.48,
            support_count: 36,
            confidence_score: null,
            lift_score: null
        },
        // Tiếp tân → Tạ tự do → VIP/PT → Tiếp tân (vòng tròn đầy đủ)
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'frequent_sequence',
            antecedent_zones: null,
            consequent_zones: null,
            sequence: [ZONE_IDS.reception, ZONE_IDS.freeWeights, ZONE_IDS.vippt, ZONE_IDS.reception],
            support_score: 0.33,
            support_count: 25,
            confidence_score: null,
            lift_score: null
        },
        // Tiếp tân → Yoga → VIP/PT (nhóm wellness)
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'frequent_sequence',
            antecedent_zones: null,
            consequent_zones: null,
            sequence: [ZONE_IDS.reception, ZONE_IDS.yoga, ZONE_IDS.vippt],
            support_score: 0.29,
            support_count: 22,
            confidence_score: null,
            lift_score: null
        },
        // Chuỗi ngắn: Cardio → Tạ tự do (warm-up pattern)
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'frequent_sequence',
            antecedent_zones: null,
            consequent_zones: null,
            sequence: [ZONE_IDS.cardio, ZONE_IDS.freeWeights],
            support_score: 0.61,
            support_count: 46,
            confidence_score: null,
            lift_score: null
        },

        // ── PREFIXSPAN: Sequential Rules (dự đoán bước tiếp theo) ──────────────
        // Sau Tiếp tân → Cardio, khả năng cao sẽ đến Tạ tự do
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'sequential_rule',
            antecedent_zones: [ZONE_IDS.reception, ZONE_IDS.cardio],
            consequent_zones: [ZONE_IDS.freeWeights],
            sequence: null,
            support_score: 0.48,
            support_count: 36,
            confidence_score: 0.76,
            lift_score: null
        },
        // Sau Tạ tự do, khả năng cao sẽ đến VIP/PT
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'sequential_rule',
            antecedent_zones: [ZONE_IDS.freeWeights],
            consequent_zones: [ZONE_IDS.vippt],
            sequence: null,
            support_score: 0.42,
            support_count: 31,
            confidence_score: 0.63,
            lift_score: null
        },
        // Sau Yoga, khả năng cao sẽ quay về Tiếp tân (thanh toán, check-out)
        {
            location_id: locationId,
            algorithm: 'prefixspan',
            pattern_type: 'sequential_rule',
            antecedent_zones: [ZONE_IDS.yoga],
            consequent_zones: [ZONE_IDS.reception],
            sequence: null,
            support_score: 0.51,
            support_count: 38,
            confidence_score: 0.82,
            lift_score: null
        }
    ]);

    // ── CUSTOMER CARE RULES – đầy đủ 3 category ─────────────────────────────────
    // ZONE rules: chỉ dùng metric_name = 'dwell_time' – worker checkZoneRules
    //   chỉ xử lý metric này, các metric khác (people_count, checkout_length) bị skip
    // RETENTION rules: metric về hành vi ghé thăm của hội viên
    // REVENUE rules: metric về tần suất sử dụng dịch vụ (proxy doanh thu)
    await CustomerCareRule.insertMany([
        // ── ZONE rules (dwell_time) ──────────────────────────────────────────────
        {
            location_id: locationId,
            category: 'zone',
            rule_id: 'RULE_ZONE_VIPPT',
            rule_name: 'Tiềm năng bán PT – khách dừng lâu khu VIP',
            logic: { metric_name: 'dwell_time', operator: '>=', threshold: 30, unit: 'seconds' },
            zone_id: ZONE_IDS.vippt,
            action: 'Nhân viên hãy tiếp cận tư vấn gói PT cho khách đang dừng tại khu VIP/PT',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'zone',
            rule_id: 'RULE_ZONE_RECEPTION',
            rule_name: 'Hàng đợi tiếp tân – khách chờ quá lâu',
            logic: { metric_name: 'dwell_time', operator: '>=', threshold: 60, unit: 'seconds' },
            zone_id: ZONE_IDS.reception,
            action: 'Mở thêm quầy check-in hoặc hỗ trợ khách đang chờ tại quầy tiếp tân',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'zone',
            rule_id: 'RULE_ZONE_CARDIO',
            rule_name: 'Khách dừng lâu khu Cardio',
            logic: { metric_name: 'dwell_time', operator: '>=', threshold: 45, unit: 'seconds' },
            zone_id: ZONE_IDS.cardio,
            action: 'Kiểm tra khách có cần hỗ trợ thiết bị hoặc hướng dẫn tại khu Cardio',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'zone',
            rule_id: 'RULE_ZONE_STORAGE',
            rule_name: 'Cảnh báo an ninh kho thiết bị',
            logic: { metric_name: 'dwell_time', operator: '>=', threshold: 20, unit: 'seconds' },
            zone_id: ZONE_IDS.equipmentStorage,
            action: 'CẢNH BÁO: Phát hiện người dừng tại khu kho thiết bị – khu vực hạn chế!',
            is_active: true
        },

        // ── RETENTION rules (hành vi hội viên) ────────────────────────────────────
        {
            location_id: locationId,
            category: 'retention',
            rule_id: 'RULE_RET_001',
            rule_name: 'Nhắc nhở hội viên ít hoạt động',
            logic: { metric_name: 'days_since_last_visit', operator: '>=', threshold: 7, unit: 'days' },
            action: 'Gửi tin nhắn nhắc nhở và ưu đãi đặc biệt cho hội viên chưa ghé thăm',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'retention',
            rule_id: 'RULE_RET_002',
            rule_name: 'Hội viên nguy cơ rời bỏ cao',
            logic: { metric_name: 'days_since_last_visit', operator: '>=', threshold: 30, unit: 'days' },
            action: 'Liên hệ trực tiếp hội viên – nguy cơ churn cao, cần chăm sóc khẩn cấp',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'retention',
            rule_id: 'RULE_RET_003',
            rule_name: 'Chúc mừng hội viên chăm chỉ',
            logic: { metric_name: 'total_sessions', operator: '>=', threshold: 50, unit: 'sessions' },
            action: 'Gửi phần thưởng khích lệ và badge "Hội viên tích cực" cho hội viên',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'retention',
            rule_id: 'RULE_RET_004',
            rule_name: 'Hội viên siêu tích cực – VIP candidate',
            logic: { metric_name: 'total_sessions', operator: '>=', threshold: 100, unit: 'sessions' },
            action: 'Đề xuất nâng cấp gói VIP 12 tháng với ưu đãi đặc biệt cho hội viên',
            is_active: true
        },

        // ── REVENUE rules (tần suất sử dụng) ──────────────────────────────────────
        {
            location_id: locationId,
            category: 'revenue',
            rule_id: 'RULE_REV_001',
            rule_name: 'Hội viên tần suất thấp – upsell cơ hội',
            logic: { metric_name: 'visits_last_30_days', operator: '<=', threshold: 4, unit: 'visits' },
            action: 'Gửi ưu đãi gói PT cá nhân để tăng tần suất tập luyện cho hội viên',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'revenue',
            rule_id: 'RULE_REV_002',
            rule_name: 'Hội viên tần suất cao – reward loyalty',
            logic: { metric_name: 'visits_last_30_days', operator: '>=', threshold: 20, unit: 'visits' },
            action: 'Tặng 1 buổi PT miễn phí cho hội viên tập đều đặn trong tháng',
            is_active: true
        },

        // ── EXPORT REPORT rules (số buổi tập 30 ngày - dùng cho phân loại khách hàng) ──
        {
            location_id: locationId,
            category: 'retention',
            rule_id: 'RULE_EXPORT_001',
            rule_name: 'Nguy cơ nghỉ tập cao',
            logic: { metric_name: 'sessions_30_days', operator: '<=', threshold: 3, unit: 'sessions' },
            action: 'Liên hệ ngay để tìm hiểu lý do và đưa ra giải pháp giữ chân khách hàng',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'retention',
            rule_id: 'RULE_EXPORT_002',
            rule_name: 'Tần suất tập thấp',
            logic: { metric_name: 'sessions_30_days', operator: '<=', threshold: 8, unit: 'sessions' },
            action: 'Gửi tin nhắn động viên và ưu đãi để khuyến khích tập luyện đều đặn hơn',
            is_active: true
        },
        {
            location_id: locationId,
            category: 'retention',
            rule_id: 'RULE_EXPORT_003',
            rule_name: 'Tần suất tập trung bình',
            logic: { metric_name: 'sessions_30_days', operator: '<=', threshold: 15, unit: 'sessions' },
            action: 'Duy trì chăm sóc định kỳ và gợi ý các lớp tập mới để tăng động lực',
            is_active: true
        }
    ]);

    // ── NOTIFICATIONS mẫu – đúng type enum mới (ZONE | RETENTION | REVENUE) ─
    // Sinh tự động từ customers khớp rules retention/revenue
    const notificationsBulk = [];
    const NOW_MS = today.getTime();

    for (const customer of customers) {
        const daysSinceVisit = customer.lastVisit
            ? Math.floor((NOW_MS - customer.lastVisit.getTime()) / 864e5)
            : 999;

        // RULE_RET_001: chưa đến >= 7 ngày → RETENTION / NORMAL
        if (daysSinceVisit >= 7 && daysSinceVisit < 30) {
            notificationsBulk.push({
                location_id: locationId,
                rule_id: 'RULE_RET_001',
                type: 'RETENTION',
                title: 'NORMAL',
                message: `Gửi tin nhắn nhắc nhở và ưu đãi đặc biệt cho hội viên chưa ghé thăm | ${customer.name} (${customer.phone})`,
                is_read: false
            });
        }

        // RULE_RET_002: nguy cơ rời bỏ >= 30 ngày → RETENTION / NORMAL (khẩn hơn)
        if (daysSinceVisit >= 30) {
            notificationsBulk.push({
                location_id: locationId,
                rule_id: 'RULE_RET_002',
                type: 'RETENTION',
                title: 'NORMAL',
                message: `Liên hệ trực tiếp hội viên – nguy cơ churn cao, cần chăm sóc khẩn cấp | ${customer.name} (${customer.phone})`,
                is_read: false
            });
        }

        // RULE_RET_003: >= 50 buổi tập → RETENTION / NORMAL (khen thưởng)
        if (customer.totalSessions >= 50 && customer.totalSessions < 100) {
            notificationsBulk.push({
                location_id: locationId,
                rule_id: 'RULE_RET_003',
                type: 'RETENTION',
                title: 'NORMAL',
                message: `Gửi phần thưởng khích lệ và badge "Hội viên tích cực" cho hội viên | ${customer.name} (${customer.phone})`,
                is_read: false
            });
        }

        // RULE_RET_004: >= 100 buổi → RETENTION / NORMAL (VIP candidate)
        if (customer.totalSessions >= 100) {
            notificationsBulk.push({
                location_id: locationId,
                rule_id: 'RULE_RET_004',
                type: 'RETENTION',
                title: 'NORMAL',
                message: `Đề xuất nâng cấp gói VIP 12 tháng với ưu đãi đặc biệt cho hội viên | ${customer.name} (${customer.phone})`,
                is_read: false
            });
        }

        // RULE_REV_001: tần suất thấp (lấy history 30 ngày) → REVENUE / NORMAL
        const visitsLast30 = Array.isArray(customer.history)
            ? customer.history.filter((h) => h.date && (NOW_MS - new Date(h.date).getTime()) <= 30 * 864e5).length
            : 0;
        if (visitsLast30 <= 4) {
            notificationsBulk.push({
                location_id: locationId,
                rule_id: 'RULE_REV_001',
                type: 'REVENUE',
                title: 'NORMAL',
                message: `Gửi ưu đãi gói PT cá nhân để tăng tần suất tập luyện cho hội viên | ${customer.name} (${customer.phone})`,
                is_read: false
            });
        }

        // RULE_REV_002: tần suất cao >= 20 lần/tháng → REVENUE / NORMAL (reward)
        if (visitsLast30 >= 20) {
            notificationsBulk.push({
                location_id: locationId,
                rule_id: 'RULE_REV_002',
                type: 'REVENUE',
                title: 'NORMAL',
                message: `Tặng 1 buổi PT miễn phí cho hội viên tập đều đặn trong tháng | ${customer.name} (${customer.phone})`,
                is_read: false
            });
        }
    }

    // Zone ALERT mẫu – giả lập sự kiện realtime đã xảy ra trước đó
    notificationsBulk.push(
        {
            location_id: locationId,
            rule_id: 'RULE_ZONE_VIPPT',
            type: 'ZONE',
            title: 'ALERT',
            message: 'Nhân viên hãy tiếp cận tư vấn gói PT cho khách đang dừng tại khu VIP/PT | Khu vực: ZONE_VIP_PT | Thời gian dừng: 312.5s',
            is_read: false
        },
        {
            location_id: locationId,
            rule_id: 'RULE_ZONE_RECEPTION',
            type: 'ZONE',
            title: 'ALERT',
            message: 'Mở thêm quầy check-in hoặc hỗ trợ khách đang chờ tại quầy tiếp tân | Khu vực: ZONE_RECEPTION_DESK | Thời gian dừng: 87.3s',
            is_read: false
        },
        {
            location_id: locationId,
            rule_id: 'RULE_ZONE_STORAGE',
            type: 'ZONE',
            title: 'ALERT',
            message: 'CẢNH BÁO: Phát hiện người dừng tại khu kho thiết bị – khu vực hạn chế! | Khu vực: ZONE_EQUIPMENT_STORAGE | Thời gian dừng: 24.1s',
            is_read: false
        },
        {
            location_id: locationId,
            rule_id: 'RULE_ZONE_CARDIO',
            type: 'ZONE',
            title: 'ALERT',
            message: 'Kiểm tra khách có cần hỗ trợ thiết bị hoặc hướng dẫn tại khu Cardio | Khu vực: ZONE_CARDIO_AREA | Thời gian dừng: 58.7s',
            is_read: true
        }
    );

    await Notification.insertMany(notificationsBulk);


    const seededAccounts = await ensureTestAccounts({ primaryLocationId: locationId });

    console.log('[seed] Done gym seed data');
    console.log(`[seed] location_code=${locationId}`);
    console.log(`[seed] zones=${zones.length}`);
    console.log(`[seed] assets=${assets.length}`);
    console.log(`[seed] customers=${customers.length}`);
    console.log(`[seed] sessions=${sessionsBulk.length}`);
    console.log(`[seed] location stats=${locationStatsBulk.length}`);
    console.log(`[seed] zone stats=${zoneStatsBulk.length}`);
    console.log(`[seed] heatmaps=${heatmapBulk.length}`);
    console.log('[seed] flow patterns=15');
    console.log('[seed] customer care rules=10');
    console.log(`[seed] notifications=${notificationsBulk.length}`);
    console.log(`[seed] manager test account: ${seededAccounts.manager.account} - password=${TEST_USER_PASSWORD}`);
    console.log(`[seed] admin test account: ${seededAccounts.admin.account} - password=${TEST_USER_PASSWORD}`);
}

seed()
    .catch((error) => {
        console.error('[seed] Failed:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
