const CameraSchema = require('../schemas/camera.schema');
const ZoneSchema = require('../schemas/zone.schema');
const cameraService = {
    async getCameraDashboardData({locationId}) {
        try {
            const result = await CameraSchema.aggregate([
                {
                    $match: { location_id: locationId }
                },
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
                                    url_image_snapshot: 1,
                                    status: 1,
                                    location_id: 1,
                                    camera_spec: 1,
                                    max_resolution: "$camera_spec.max_resolution",
                                    current_resolution: "$camera_spec.current_resolution",
                                    last_heartbeat: 1,
                                    installation_date: 1,
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
            const data = cameraData || {};

            const finalCameraCode = (data.camera_code || data.cameraCode || cameraCode || '').toString().trim();
            const location_id = (data.location_id || data.locationId || '').toString().trim();
            const camera_name = (data.camera_name || data.cameraName || '').toString().trim();
            const rtsp_url = (data.rtsp_url || data.rtspUrl || '').toString().trim();
            const url_image_snapshot = data.url_image_snapshot || data.urlImageSnapshot;
            const status = data.status;
            const camera_spec = data.camera_spec || data.cameraSpec;
            const camera_state = data.camera_state || data.cameraState;

            let last_heartbeat;
            if (data.last_heartbeat || data.lastHeartbeat) {
                const parsedLastHeartbeat = new Date(data.last_heartbeat || data.lastHeartbeat);
                if (Number.isNaN(parsedLastHeartbeat.getTime())) {
                    throw new Error('Invalid last_heartbeat date');
                }
                last_heartbeat = parsedLastHeartbeat;
            }

            let installation_date;
            if (data.installation_date || data.installationDate) {
                const parsedInstallationDate = new Date(data.installation_date || data.installationDate);
                if (Number.isNaN(parsedInstallationDate.getTime())) {
                    throw new Error('Invalid installation_date date');
                }
                installation_date = parsedInstallationDate;
            }

            if (!finalCameraCode) {
                throw new Error('Camera Code is required');
            }

            if (!location_id) {
                throw new Error('Location ID is required');
            }

            if (!camera_name) {
                throw new Error('Camera Name is required');
            }

            if (!rtsp_url) {
                throw new Error('RTSP URL is required');
            }

            const updatePayload = {
                location_id,
                camera_name,
                camera_code: finalCameraCode,
                rtsp_url,
                camera_spec,
                camera_state,
                updated_at: new Date()
            };

            if (status !== undefined && status !== null && String(status).trim() !== '') {
                updatePayload.status = status;
            }

            if (url_image_snapshot !== undefined) {
                updatePayload.url_image_snapshot = url_image_snapshot;
            }

            if (last_heartbeat !== undefined) {
                updatePayload.last_heartbeat = last_heartbeat;
            }

            if (installation_date !== undefined) {
                updatePayload.installation_date = installation_date;
            }

            const setOnInsertPayload = {
                created_at: new Date()
            };

            if (updatePayload.status === undefined) {
                setOnInsertPayload.status = 'inactive';
            }

            return await CameraSchema.findOneAndUpdate(
                { camera_code: finalCameraCode },
                {
                    $set: updatePayload,
                    $setOnInsert: setOnInsertPayload
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
    },
    async getCameraAndZoneInfo({ locationId }) {
        try {
            const cameras = await ZoneSchema.aggregate([
                { $match: { location_id: locationId } },
                {
                    $lookup: {
                        from: 'cameras',
                        localField: 'camera_id',
                        foreignField: 'camera_code',
                        as: 'camera_info'
                    }
                },
                {
                    $unwind: {
                        path: '$camera_info',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        _id: 0,
                        camera_code: '$camera_id',
                        zone_id: 1,
                        zone_name: 1,
                        camera_name: '$camera_info.camera_name'
                    }
                }
            ]);

            return cameras;
        } catch (error) {
            throw error;
        }
    },

    async getCameraWithZonesByAllcationId({ allcationId, allocationId, locationId }) {
        try {
            const finalLocationId = (allcationId || allocationId || locationId || '').toString().trim();

            if (!finalLocationId) {
                throw new Error('allcationId (or allocationId/locationId) is required');
            }

            const cameras = await CameraSchema.aggregate([
                {
                    $match: {
                        location_id: finalLocationId
                    }
                },
                {
                    $lookup: {
                        from: 'zones',
                        let: {
                            cameraCode: '$camera_code',
                            locationId: '$location_id'
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$camera_id', '$$cameraCode'] },
                                            { $eq: ['$location_id', '$$locationId'] }
                                        ]
                                    }
                                }
                            },
                            {
                                $sort: { created_at: -1 }
                            }
                        ],
                        as: 'zones'
                    }
                },
                {
                    $sort: { created_at: -1 }
                }
            ]);

            return cameras;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = cameraService;