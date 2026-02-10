const logger = require("../utils/logging");

const handleException = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  logger.error({
    message: err.message,
    statusCode,
    method: req.method,
    path: req.originalUrl,
    params: req.params,
    query: req.query,
    stack: isProd ? undefined : err.stack
  });

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message:
      statusCode >= 500
        ? 'Internal Server Error'
        : err.message
  });
};

module.exports = handleException;
