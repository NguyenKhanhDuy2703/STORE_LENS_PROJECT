const { getDashboardStats, getAllDashboardStats, getAvailableLocations } = require('../service/dashboard.service');
const { success, error } = require('../utils/response');
const { StatusCodes } = require('http-status-codes');

const dashboardStatsController = async (req, res) => {
  try {
    const { location_id } = req.params;
    let data;

    if (!location_id) {
      data = await getAllDashboardStats();
      return success({
        res,
        data,
        message: 'Dashboard stats retrieval successful (all locations)',
        code: StatusCodes.OK
      });
    }

    data = await getDashboardStats(location_id);

    return success({
      res,
      data,
      message: 'Dashboard stats retrieval successful',
      code: StatusCodes.OK
    });
  } catch (err) {
    throw err;
  }
};

const getAvailableLocationsController = async (req, res) => {
  try {
    const data = await getAvailableLocations();

    return success({
      res,
      data,
      message: 'Available locations retrieval successful',
      code: StatusCodes.OK,
    });
  } catch (err) {
    throw err;
  }
};

module.exports = { dashboardStatsController, getAvailableLocationsController };