const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
      trim: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },
  {
    // to sprawia, że wirtualne pola się wyświetlą, np takie które zostaną obliczone na podstawie istniejących pól w obiekcie
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); // każda kombinacja tour i user musi być unikalna, jeden użytkownik będzie mógł dodać jedną opinię do jednej wycieczki

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// statics - tworzenie metody statycznej, statyczna metoda musi być wywołana na Modelu -> Model.metoda_statyczna()
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  // this - current Model = Review
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  // console.log(stats); // [ { _id: 68d140608cbaf05500a6d0ba, nRating: 7 avgRating: 2.857142857142857 } ]

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  // this.constructor = Review (Model)
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
// QUERY MIDDLEWARE - bo jest 'findOneAnd'
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // findOneAnd to tylko alias na findByIdAndUpdate lub findByIdAndDelete, nawet jak mamy findByIdAndUpdate to prawdziwe zapytanie to findOneAndUpdate
  this.r = await this.findOne(); // r - review
  // console.log(this.r);

  next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  // this.r = await this.findOne(); does NOT work, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
