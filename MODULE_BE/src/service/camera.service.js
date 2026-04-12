const CameraSchema = require('../schemas/camera.schema');

const cameraService = {
    async getCameraDashboardData() {
        try {
            const result = await CameraSchema.aggregate([
                {
                    $facet: {
                        "total": [{ $count: "count" }],
                        "active": [
                            { $match: { status: "active" } },
                            { $count: "count" }
                        ],
                        "error": [
                            { $match: { status: { $in: ["error", "disconnect"] } } },
                            { $count: "count" }
                        ],
                        "camera_list": [
                            { $sort: { created_at: -1 } },
                            {
                                $project: {
                                    id: "$_id",
                                    camera_name: 1,
                                    camera_code: 1,
                                    rtsp_url: 1,
                                    status: 1,
                                    location_id: 1,
                                    last_heartbeat: 1,
                                    updated_at: 1,
                                    _id: 0
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        metrics: {
                            total: { $ifNull: [{ $arrayElemAt: ["$total.count", 0] }, 0] },
                            active: { $ifNull: [{ $arrayElemAt: ["$active.count", 0] }, 0] },
                            error: { $ifNull: [{ $arrayElemAt: ["$error.count", 0] }, 0] }
                        },
                        camera_list: 1
                    }
                }
            ]);

            return {
                ...(result[0] || { metrics: { total: 0, active: 0, error: 0 }, camera_list: [] }),
                last_updated: new Date()
            };
        } catch (error) {
            throw error;
        }
    },

    async upsertCamera(cameraCode, cameraData) {
        try {
            const { status, camera_code, created_at, ...otherData } = cameraData;

            return await CameraSchema.findOneAndUpdate(
                { camera_code: cameraCode },
                {
                    $set: { 
                        ...otherData, 
                        updated_at: new Date() 
                    },
                    $setOnInsert: { 
                        status: status || 'inactive',
                        created_at: new Date()
                    }
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                    setDefaultsOnInsert: true
                }
            );
        } catch (error) {
            throw error;
        }
    },

    async deleteCamera(cameraCode) {
        try {
            return await CameraSchema.findOneAndDelete({ camera_code: cameraCode });
        } catch (error) {
            throw error;
        }
    },

    async updateImgforCamera({ locationId, cameraCode, urlImg }) {
        try {
            return await CameraSchema.updateOne(
                {
                    location_id: locationId,
                    camera_code: cameraCode,
                },
                {
                    $set: {
                        url_img: urlImg,
                        updated_at: new Date()
                    },
                }
            );
        } catch (error) {
            throw error;
        }
    }
};

module.exports = cameraService;