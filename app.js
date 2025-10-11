const path = require('path'); // moduł ścieżek, uzywany do manipulowania nazwami ścieżek
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express(); // express jest funkcją, która wraz z wywołaniem dodaje mnóstwo metod przypisanej zmiennej
app.set('view engine', 'pug'); // dodanie templete engine - pug
app.set('views', path.join(__dirname, 'views')); // nie używamy ./ a nazwy folderu, więc importujemy moduł 'path', który zmanipuluje nazwę ścieżki

// 1) GLOABL MIDDLEWARES
// Serving static files - dzięki temu pliki z rozszerzeniem pug będą pobierały pliki statyczne (html, css, image) z folderu public
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", 'https://api.mapbox.com'],
//       styleSrc: [
//         "'self'",
//         'https://api.mapbox.com',
//         'https://fonts.googleapis.com',
//       ],
//       imgSrc: [
//         "'self'",
//         'data:',
//         'blob:',
//         'https://api.mapbox.com',
//         'https://*.tiles.mapbox.com',
//       ],
//       connectSrc: [
//         "'self'",
//         'https://api.mapbox.com',
//         'https://events.mapbox.com',
//       ],
//       fontSrc: ["'self'", 'https://fonts.gstatic.com'],
//     },
//   }),
// );

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // GET /api/v1/tours/2 200 0.830 ms - 887
}

// Limit requets from same API
const limiter = rateLimit({
  // opcje limitera, przy podanych niżej umożliwiają temu samemu użytkownikowi wykonać 100 requestów w 1h
  max: 100,
  windowMs: 60 * 60 * 1000, // time window
  message: 'Too many request from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' })); // expres.json() jest wtyczką (middleware), która może modyfikować dane przychodzące od klienta (z requesta)
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // dostęp do danych z formularza
app.use(cookieParser()); // dostęp do cookies z requesta,

// Data sanitization against NoSQL query injection
app.use(mongoSanitize()); // ten middleware usuwa operatory: $ i . z req.body, req.query, req.params

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter); // tourRouter, userRouter, reviewRouter są MIDDLEWARE'ami
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // '*' - przechwytuje wszystkie errory

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // Przekazujemy err aby wywołał się error handling middleware, cokolwiek przekazane jako argument do next() spowoduje wywołanie error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
