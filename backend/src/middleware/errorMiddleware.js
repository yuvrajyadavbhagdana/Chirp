const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  if (err.name === 'ValidationError') status = 400;
  if (err.code === 11000) status = 409;
  if (err.name === 'CastError') status = 400;
  res.status(status).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
