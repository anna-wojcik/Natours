class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // konstruktor rodzica, przekazujemy tylko message bo to tylko parametr który jest wbudowany do klasy Error

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    this.isOperational = true; // To błędy przewidziane przez programistę (np. niepoprawne ID, brak wymaganych danych, nieautoryzowany dostęp).

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
