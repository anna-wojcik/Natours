const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

// tworzymy schemat
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters'],
      // validate: {
      //   validator: validator.isAlpha,
      //   message: 'Tour Name must only contain characters',
      // },
      // krócej
      // validate: [validator.isAlpha, 'Tour Name must only contain characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
      // set is called every time new value is set, it runs callback function
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON - format do przechowywania danych geoprzestrzennych
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // dodanie referencji do User
      },
    ],
  },
  {
    // to sprawia, że wirtualne pola się wyświetlą, np takie które zostaną obliczone na podstawie istniejących pól w obiekcie
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 }); // stwórz indeks na polu price w kolejności rosnącej, żeby wyszukiwanie/sortowanie po cenie działało szybciej, 1 rosnąco, -1 malejąco
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Wirtualne pole, nie jest zapisane w bazie danych, wyświetla się tylko przy query
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate - wirtualna referencja do reviewsId
tourSchema.virtual('reviews', {
  ref: 'Review', // referencja do obiektu 'Review'
  foreignField: 'tour', // gdzie to pole jest w obcym obiekcie: Review - pole 'tour'
  localField: '_id', // gdzie to pole jest w tym obiekcie: Tour - pole '_id'
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create() (bez .insertMany())
tourSchema.pre('save', function (next) {
  // this: to aktualnie przetwarzany dokument
  this.slug = slugify(this.name, { lower: true });

  // next(): wywłoanie kolejnego middlewara
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   // nie mamy dostępu do dokumentu przez this, lecz przez doc
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE: runs before or after query is executed
tourSchema.pre(/^find/, function (next) {
  // /^find/ - wszytsko co się zaczyna od find
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  // populate - wypełnić, chcemy wypełnić pole guides danymi odnoszącymi się do User, (tylko przy query będą się wypełniać tymi danymi, w bazie danych będą tylko User_id jako referencja do User)
  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} ms`);

//   next();
// });

// AGGREGATE MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  });

  next();
});

// tworzymy model, zaczynamy wielką literą
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
