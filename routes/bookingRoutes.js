const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect); // wszystkie poniższe ścieżki będą chronione - wymagane jest zalogowanie
// tourId - id wycieczki która jest aktualnie rezerwowana
router
  // endpoint wywołany z Frontendu
  .route('/checkout-session/:tourId')
  .get(bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide')); // poniższe ścieżki będą dostępne tylko dla admina i lead-guida
router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);
router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
