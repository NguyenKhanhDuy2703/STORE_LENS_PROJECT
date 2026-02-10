const {version} = require("../config").getConfig().api;
const {error , success} =  require("../utils/response")
const {StatusCodes } = require("http-status-codes")
const routes = (app) => {
app.use(`${version}` , (req , res) => {
   try {
    success(res , null , "API is working" , StatusCodes.OK)
   } catch (e) {
    error(e.message ,  StatusCodes.INTERNAL_SERVER_ERROR)
   }
})
}
module.exports = routes;