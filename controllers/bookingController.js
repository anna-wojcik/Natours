// zbudowanie Stripe na backendzie
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Create checkout session, tworzymy sesję płatności
  const session = await stripe.checkout.sessions.create({
    // dane o sesji (session)
    payment_method_types: ['card'], // metody płatności
    // niebezpieczne - ktoś mógłby zabookować bez płacenia
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`, // adres na który klient zostanie przeniesiony po dokonaniu płatności
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`, // adres na który klient zostanie przeniesiony po anulowaniu płatności
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    // pole, które pozwoli nam przekazać dane o sesji jaką aktualnie tworzymy, jest to ważne bo jak płatność będzie dokonana to będziemy mieli dostęp do tych danych.
    // dane o produkcie
    // line_items: [
    //   // pola pochodzące od Stripe - nie można dodać własnych
    //   {
    //     name: `${tour.name} Tour`,
    //     description: tour.summary,
    //     images: [`http://wwww.natours.dev/img/tours/${tour.imageCover}`],
    //     amount: tour.price * 100, // konwertujemy na centy / grosze
    //     currency: 'usd',
    //     quantity: 1,
    //   },
    // ],

    // dane o produkcie
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100, // konwertujemy na centy / grosze
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This i only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });
//   // bez next() bo nie chcemy aby przejść do kolejnego middlewara, który spowoduje wygenerowanie listy wycieczek
//   res.redirect(req.originalUrl.split('?')[0]); // przejście do strony głównej
// });

// dodanie booking do bazy dnaych
const createBookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.line_items[0].price_data.unit_amount / 100;
  await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  // Kod, który się wykona gdy dojdzie do dokonania płatności
  const signature = req.headers['stripe-signature'];

  // req.body musi być w surowej formie, nie może być jako JSON
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // sprawdzenie czy istnieje event który chcemy, jeżeli istnieje to chcemy dodać booking do bazy danych
  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object); // przesłanie danych o sesji

  res.status(200).json({ received: true }); // response to Stripe
};

exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
