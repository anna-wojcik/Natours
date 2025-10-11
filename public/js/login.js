/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      // url: 'http://127.0.0.1:3000/api/v1/users/login',   
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      // po zalogowaniu przeniosi nas na stronę główną po 1.5s
      window.setTimeout(() => {
        location.assign('/'); // przekierowanie na stronę główną
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      // url: 'http://127.0.0.1:3000/api/v1/users/logout',
      url: '/api/v1/users/logout',
    });

    if (res.data.status === 'success') location.assign('/login'); // przekierowanie na stronę logowania
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Try again.');
  }
};
