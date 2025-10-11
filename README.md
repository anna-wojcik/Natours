# Natours - Adventure Tours Booking App
Natours is a full-stack web application that allows users to explore and book exciting adventure tours around the world.
Users can view detailed information about each tour, log in to their account, book a tour, and securely pay for it through Stripe Checkout.

## Table of Contents
* [Site Overview](#site-overview)
    * [Home page](#home-page)
    * [Tour details page](#tour-details-page)
    * [User account page](#user-account-page)
* [Technologies Used](#technologies-used)
* [Available Scripts](#available-scripts)
* [Acknowledgements](#acknowledgements)
* [Author](#author)

## Site Overview
The application offers an immersive experience for users looking to discover and book adventure tours.
It includes a public area for browsing tours and a private area for registered users to manage their bookings and profile.

### Home page
Displays a list of available tours fetched from the MongoDB database. Each tour card shows the name, duration, difficulty, price, and average rating. Users can click the “Details” button to view more information about a specific tour.

### Tour details page
Provides comprehensive information about the selected tour, including:
- Description, duration, and difficulty level
- Locations displayed on an interactive Mapbox map
- Tour guides and images
- Customer reviews and ratings
- Stripe Checkout button to book and pay for the tour
Once the booking is confirmed, the user is redirected to Stripe’s secure payment page.

### User account page
Accessible only to logged-in users.
Includes:
- User profile data (name, email, photo)
- Option to update personal information and password
- List of booked tours and user reviews

## Technologies Used
### Backend 
- Node.js
- Express.js
- MongoDB
- Mongoose
- Stripe API (payment integration)
- JWT Authentication
- Nodemailer (for email sending)
- Pug (templete engine)
- Axios (for HTTP request)
- Mapbox (maps)

### Frontend
- Pug templates rendered on the server
- CSS
- JavaScript ES6
- BEM Convention
- Media Query
- Responsive design (Flex & Grid & Media Queries)

### Development Tools
- Dotenv (Loads environment variables from .env file)
- Parcel Bundler
- Babel (
- Bcrypt.js (Password hashing)
- Multer (Handling file uploads)
- Sharp (Image processing and optimization)
- Slugify (Generates URL-friendly slugs)
- Helmet (Sets secure HTTP headers)
- HPP (Protects against HTTP Parameter Pollution)
- XSS Clean (Sanitizes user input against XSS attacks)
- Express mongo sanitize (Prevents MongoDB injection attacks)
- Express Rate Limit (Limits requests to prevent brute-force attacks)
- Cookie parser (Parses cookies attached to client requests)

## Available Scripts
In the project directory, you can run:

### `npm start` 
Runs the app in development mode.

### `npm run start:prod` 
Runs the app in production mode.

### `npm run watch:js`
Watches frontend JavaScript files and rebuilds them into /public/js/bundle.js using Parcel.

### `npm run build:js`
Builds final compressed JavaScript bundle.

## Acknowledgements
This project was built while following the “Node.js, Express, MongoDB & More: The Complete Bootcamp” course by Jonas Schmedtmann.

## Author
Created by Anna Wójcik.
