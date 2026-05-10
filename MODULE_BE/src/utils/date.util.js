const moment = require('moment-timezone');

const dateUtil = ({ type, startCustom, endCustom, year, month }) => {
    const TIMEZONE = 'Asia/Ho_Chi_Minh';
    const nowInVN = moment().tz(TIMEZONE);
    let startDate, endDate;
    startDate = nowInVN.clone().startOf('day');
    endDate = nowInVN.clone().endOf('day');

    switch (type) {

        case 'specificMonth': {
            if (!year || !month) throw new Error("specificMonth requires year and month");
            const monthStr = String(month).padStart(2, '0');
            startDate = moment.tz(`${year}-${monthStr}-01`, "YYYY-MM-DD", TIMEZONE).startOf('month');
            endDate = startDate.clone().endOf('month');
            // Nếu là tháng hiện tại → cắt endDate về hôm nay để không lấy tương lai
            if (endDate.isAfter(nowInVN)) {
                endDate = nowInVN.clone().endOf('day');
            }
            break;
        }

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

        case "thisYear":
            startDate = nowInVN.clone().startOf('year');
            endDate = nowInVN.clone().endOf('year');
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
    // moment-timezone handles timezone context correctly
    // .toDate() returns Date object with correct UTC timestamp
    return moment().tz(TIMEZONE).toDate();
}
module.exports = {
    dateUtil,
    getCurrnetDateVN,
};