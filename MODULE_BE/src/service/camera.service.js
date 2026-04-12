const Camera = require('../schemas/camera.schema');

const getCameraKPIMetrics = async ({ locationId } = {}) => {
    try {
        const cameras = await Camera.find({ location_id: locationId });
        return {
            total_cameras: cameras.length,
            active_cameras: cameras.filter(c => c.status === 'active').length,
            issue_cameras: cameras.filter(c => c.status === 'error' || c.status === 'disconnect').length,
            last_updated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

const getCameraListDetails = async ({ locationId } = {}) => {
    try {
        const cameras = await Camera.find({ location_id: locationId }).sort({ created_at: -1 });
        return {
            camera_list: cameras.map(c => ({
                id: c._id,
                camera_name: c.camera_name,
                camera_code: c.camera_code,
                rtsp_url: c.rtsp_url,
                location_id: c.location_id,
                status: c.status,
                last_heartbeat: c.last_heartbeat,
                updated_at: c.updated_at
            })),
            last_updated: new Date()
        };
    } catch (error) {
        throw error;
    }
};

const createCamera = async (cameraData) => {
    try {
        const camera = new Camera(cameraData);
        return await camera.save();
    } catch (error) {
        throw error;
    }
};

const updateCamera = async (cameraCode, updateData) => {
    try {
        const { status, ...validUpdateData } = updateData;
        return await Camera.findOneAndUpdate(
            { camera_code: cameraCode },
            validUpdateData,
            { new: true }
        );
    } catch (error) {
        throw error;
    }
};

const deleteCamera = async (cameraCode) => {
    try {
        return await Camera.findOneAndDelete({ camera_code: cameraCode });
    } catch (error) {
        throw error;
    }
};

const updateImgforCamera = async ({ locationId, cameraCode, urlImg }) => {
    try {
        return await Camera.updateOne(
            {
                location_id: locationId,
                camera_code: cameraCode,
            },
            {
                $set: {
                    url_img: urlImg,
                },
            }
        );
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getCameraKPIMetrics,
    getCameraListDetails,
    createCamera,
    updateCamera,
    deleteCamera,
    updateImgforCamera,
};
