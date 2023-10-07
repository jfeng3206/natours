const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// 1) MIDDLEWARE
//console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  //this is middleware. Steps between request and response.
  console.log('Hello from the middleware 😍');
  next();
});
app.use((req, res, next) => {
  //this is middleware. Steps between request and response.
  req.requestTime = new Date().toISOString();
  next();
});
// 3) ROUTES
app.use('/api/v2/tours', tourRouter);
app.use('/api/v2/users', userRouter);
// 4) SERVER START
module.exports = app;
