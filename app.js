// const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({ path: './config.env' });

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/userRoutes');
const shelfRouter = require('./routes/shelfRoutes');
const locationRouter = require('./routes/locationRoutes');
const configRouter = require('./routes/configRoutes');
const lightRouter = require('./routes/lightRoutes');
const colorRouter = require('./routes/colorRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.options('*', cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/shelf', shelfRouter);
app.use('/location', locationRouter);
app.use('/config', configRouter);
app.use('/light', lightRouter);
app.use('/color', colorRouter);
app.use('/user', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// catch 404 and forward to error handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// error handler
// app.use((err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//   console.log(res);
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

module.exports = app;
