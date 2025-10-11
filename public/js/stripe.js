/* eslint-disable */
// zbudowanie Stripe na Frontendzie
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51SFfwZF1ESuGTS3capfhiryrzAFzgsjPnt2K5kjPwVMQxxESXyUxALUbOK1WnMH0RV5EJhOZ7F50ziiVRotI0hE700Zlkqjiyk',
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios({
      method: 'GET',
      url: `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    });

    // krócej, bo domyślnie axios ma metodę GET
    // const session = await axios(
    //   `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`,
    // );

    // 2) Create checkout form + charge credit card, przekierowanie do płatności i pobranie opłaty
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
