const {version} = require("../config").getConfig().api;
const {error , success} =  require("../utils/response")
const {StatusCodes } = require("http-status-codes")
const routes = (app) => {
  app.get(`${version}/healthy`, (req, res) => {
   try {
      success({
         res , 
         message : "API is healthy" , 
         code : StatusCodes.OK
      })
   } catch (e) {
      error({
         message : "Health check failed" , 
         code : StatusCodes.INTERNAL_SERVER_ERROR , 
         errors : [e.message]
      })
   }
  });

}
module.exports = routes;