const moment = require('moment-timezone');

const dateUtil = ({ type, startCustom, endCustom }) => {
    const TIMEZONE = 'Asia/Ho_Chi_Minh';
    const nowInVN = moment().tz(TIMEZONE);
    let startDate, endDate;
    startDate = nowInVN.clone().startOf('day');
    endDate = nowInVN.clone().endOf('day');

    switch (type) {
        case "today":
            break;

        case "yesterday":
            startDate.subtract(1, 'days');
            endDate.subtract(1, 'days');
            break;

        case "last7days":
            startDate.subtract(6, 'days');
            break;

        case "last30days":
            startDate.subtract(29, 'days');
            break;

        case "custom":
            if (startCustom && endCustom) {
                startDate = moment.tz(startCustom, TIMEZONE).startOf('day');
                endDate = moment.tz(endCustom, TIMEZONE).endOf('day');
            } else {
                throw new Error("Custom date requires startCustom and endCustom");
            }
            break;

        default:
            throw new Error("Invalid date filter type");
    }

    return {
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
    };
};
const getCurrnetDateVN = () => {
    const TIMEZONE = 'Asia/Ho_Chi_Minh';
    return moment().tz(TIMEZONE).toDate();
}
module.exports = {
    dateUtil,
    getCurrnetDateVN,
};