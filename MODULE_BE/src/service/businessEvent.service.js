const BusinessEvent = require('../schemas/businessEvent.schema');

const upsertBusinessEvent = async (data) => {
    const { event_code, ...updateFields } = data;
    const result = await BusinessEvent.findOneAndUpdate(
        { event_code },
        { $set: updateFields },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return result;
};

const getBusinessEvents = async ({ locationId, startDate, endDate, status } = {}) => {
    const query = { location_id: locationId };

    if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) {
        query.status = status;
    }

    return BusinessEvent.find(query).sort({ date: -1 });
};

const getBusinessEventDetail = async (eventCode) => {
    const event = await BusinessEvent.findOne({ event_code: eventCode });

    if (!event) {
        const err = new Error('Invoice not found');
        err.statusCode = 404;
        throw err;
    }

    return event;
};

module.exports = {
    upsertBusinessEvent,
    getBusinessEvents,
    getBusinessEventDetail
};
