const NotificationSchema = require('../schemas/notification.schema');
const { dateUtil } = require("../utils/date.util");

const getAllNotifications = async ({ location_id }) => {
    try {
        const { startDate, endDate } = dateUtil({ type: "last7days" });

        return await NotificationSchema.find({
            location_id,
            created_at: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .sort({ created_at: -1 })
        .limit(100)
        .lean();

    } catch (error) {
        throw error;
    }
};

const updateReadStatus = async (id, status) => {
    try {
        return await NotificationSchema.findByIdAndUpdate(
            id,
            { is_read: status },
            { new: true }
        );
    } catch (error) {
        throw error;
    }
};

module.exports = { getAllNotifications, updateReadStatus };