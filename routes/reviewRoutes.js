const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); // mergeParams pozwala na dostęp do parametrów poprzedniego routera - tourRouter
// domyślnie każdy osobny router (tourRouter, userRouter, reviewRouter) ma dostęp tylko do parametrów swojego URL-a

// GET  /tours/123456/reviews/785456
// GET  /tours/123456/reviews
// POST /tours/123456/reviews
// POST /reviews

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  // .get(reviewController.getAllUserReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );

module.exports = router;
