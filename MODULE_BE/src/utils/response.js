const success = ( res , data = null , message  , code  , meta = {}) => {
    if (!res || typeof res.status !== 'function' || typeof res.json !== 'function') {
        throw new Error("Response object is invalid");
    }
   
    return res.status(code).json({
        status : "success",
        code,
        message,
        data,
        meta
    });
}
const error = ( message = "Error" , code = 500 , errors = []) => {
const err = new Error(message);
  err.statusCode = code;
  err.errors = errors;
  throw err;
}
module.exports = {
    success,
    error
}