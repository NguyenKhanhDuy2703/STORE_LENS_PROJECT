const moment = require('moment-timezone');
const dateUtil = {
    getVNStartofDay(date){
        return moment(date).tz("Asia/Ho_Chi_Minh").startOf('day').toDate();
    }
}
module.exports = dateUtil;