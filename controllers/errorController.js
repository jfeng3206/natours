const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = ` Invalid ${err.message}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const [errorField, errorValue] = Object.entries(err.keyValue).flat();
  const message = `Duplicate ${errorField} value: ${errorValue}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errorslist = Object.values(err.errors).map((el) => el.message);
  const message = ` Invalid input data. ${errorslist.join(', ')}`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unkown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'ERROR',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    console.log(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    sendErrorProd(error, res);
  }
};
