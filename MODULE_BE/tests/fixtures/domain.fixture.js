const Location = require('../../src/schemas/location.schema');
const Camera = require('../../src/schemas/camera.schema');

const createLocationAndCameraContext = async () => {
    const suffix = Date.now().toString();
    const locationCode = `LOC_${suffix}`;
    const cameraCode = `CAM_${suffix}`;

    await Location.create({
        location_code: locationCode,
        name: 'Test Location',
        address: '123 Test Street',
        type_model: 'RETAIL',
        business_hours: {
            open: '08:00',
            close: '20:00',
            timezone: 'Asia/Ho_Chi_Minh',
        },
    });

    await Camera.create({
        location_id: locationCode,
        camera_name: 'Front Camera',
        camera_code: cameraCode,
        rtsp_url: 'rtsp://localhost:8554/stream',
        status: 'online',
    });

    return { locationCode, cameraCode };
};

const createLocationContext = async () => {
    const suffix = Date.now().toString();
    const locationCode = `LOC_${suffix}`;

    await Location.create({
        location_code: locationCode,
        name: 'Test Location',
        address: '123 Test Street',
        type_model: 'RETAIL',
        business_hours: {
            open: '08:00',
            close: '20:00',
            timezone: 'Asia/Ho_Chi_Minh',
        },
    });

    return { locationCode };
};

module.exports = {
    createLocationAndCameraContext,
    createLocationContext,
};
