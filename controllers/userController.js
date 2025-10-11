const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   // miejsce docelowe zapisu
//   destination: (req, file, callback) => {
//     callback(null, 'public/img/users'); // jeżeli nie ma błędu to jako pierwszy arguemnt dajemy null, drugi to miejsce docelowe zapisu
//   },
//   // nazwa pliku do zapisu
//   filename: (req, file, cb) => {
//     // user-756485524ab4-36582369523.jpg
//     // user-userId-Time.jpg
//     const extension = file.mimetype.split('/')[1];
//     // req.file:
//     //   {
//     //    fieldname: 'photo',
//     //    originalname: 'leo.jpg',
//     //    mimetype: 'image/jpeg',
//     //    destination: 'public/img/users',
//     //    filename: 'user-5c8a1f292f8fb814b56fa184-1759596249950.jpeg',
//     //    path: 'public\\img\\users\\'user-5c8a1f292f8fb814b56fa184-1759596249950.jpeg',
//     //    size: 207078
//     //  }
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
//   // cb - callback
// });

const multerStorage = multer.memoryStorage(); // image is stored in buffer / in memory

// sprawdzenie czy załadowane jest zdjęcie, jeżeli tak to zwracamy true do callback function, jeżeli nie to false do cb
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo'); // middleware function

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  // jeżeli nie było zmiany zdjęcia to przejdziemy do dalszego middleware
  if (!req.file) return next();

  // jeżeli zmiana zdjęcia to zmienimy wymiary
  // jeżeli zapisujemy zdjęcie za pomocą multer.memoryStorage() to req.file.filename nie ma wartości, więc trzeba dodać wartość
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 }) // jakość 90%
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// 2) ROUTE HANDLERS
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  // new: true - zwraca nowy obiekt a nie stary

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'fail',
    message: 'This route is not defined! Please use /signup instead.',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do NOT update password with this
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
