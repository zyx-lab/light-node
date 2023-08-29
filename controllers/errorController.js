const handleCastErrorDB = (err, req, res) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return res.status(200).json({
    code: '400',
    message: message,
  });
};

const handleDuplicateFieldsDB = (err, req, res) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return res.status(200).json({
    code: '400',
    message: message,
  });
};

const handleValidationErrorDB = (err, req, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return res.status(200).json({
    code: '400',
    message: message,
  });
};

// const sendErrorDev = (err, req, res) =>
//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   });

const sendErrorProd = (err, req, res) => {
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  return res.status(200).json({
    code: '500',
    message: 'Internal error',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error;
  if (err.name === 'CastError') handleCastErrorDB(err, req, res);
  if (err.code === 11000) return handleDuplicateFieldsDB(err, req, res);
  if (err.name === 'ValidationError')
    return handleValidationErrorDB(err, req, res);

  sendErrorProd(error || err, req, res);
  // if (process.env.NODE_ENV === 'development') {
  //   sendErrorDev(err, req, res);
  // } else if (process.env.NODE_ENV === 'production') {
  //   let error;
  //   if (err.name === 'CastError') error = handleCastErrorDB(err);
  //   if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  //   if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

  //   sendErrorProd(error || err, req, res);
  // }
};
