const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  // const message = `Invalid input data. ${err.message}`;
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Your token expired. Please log in again!', 401);

// środkowisko developerskie - Tutaj zwracamy wszystko co się da, żeby łatwo debugować (znajować błędy):
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack, // (gdzie wystąpił błąd - jako programista od razu wiemy gdzie wystąpił błąd)
    });
    // takich informacji nie wolno pokazywać użytkownikowi produkcyjnemu, bo to potencjalnie zdradza wrażliwe szczegóły o systemie (np. strukturę kodu, nazwy plików, ścieżki)
  }

  // B) RENDERED WEBSITE
  console.error('ERROR', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

// PRODUCTION - tryb gdy aplikacja jest już udostępniona klientom
// środkowisko produkcyjne - tutaj aplikacja odróżnia błędy operacyjne od programistycznych/nieznanych
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    // Błędy operacyjny przewidziane przez programistę (np. niepoprawne ID, brak wymaganych danych)
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programing or other unknow error: don't leak error details, błędy programistyczne lub nieznane, (np. literówka w kodzie, brak zmiennej środkowiskowej, bug w kodzie). Tutaj użytkownik nie powienien wiedzieć nic więcej, poza tym, że coś poszło nie tak
    // 1) log error
    console.error('ERROR', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }

  // B) RENDERED WEBSITE
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // Programing or other unknow error: don't leak error details, błędy programistyczne lub nieznane, (np. literówka w kodzie, brak zmiennej środkowiskowej, bug w kodzie). Tutaj użytkownik nie powienien wiedzieć nic więcej, poza tym, że coś poszło nie tak
  // 1) log error
  console.error('ERROR', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'PLease try again later.',
  });
};

// funckja strzałkowa (arrow function) jest error handling middleware'em
//GLOBAL ERROR CONTROLLER
module.exports = (err, req, res, next) => {
  // default statusCode na wypadek gdyby error nie pochodził od nas
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; // gubi err.name i err.message
    error.message = err.message;
    error.name = err.name;
    // let error = err;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, req, res);
  }
};
