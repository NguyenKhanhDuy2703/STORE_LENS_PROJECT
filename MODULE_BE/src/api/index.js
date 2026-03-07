const axios = require('axios');
const config = require('../config');
const {port} = require('../config').getConfig().apiAI;
const {error , success} = require('../utils/response')
const { StatusCodes } = require("http-status-codes");
const axiosInstance = axios.create({
    baseURL: `http://localhost:${port}`,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
}); 


module.exports = axiosInstance;