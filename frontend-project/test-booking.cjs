const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
});

async function run() {
  try {
    // Login as Admin
    console.log('Logging in as admin...');
    const loginRes = await api.post('/auth/login', { username: 'admin', password: 'password123' });
    const cookie = loginRes.headers['set-cookie'];
    if (cookie) {
      api.defaults.headers.Cookie = cookie;
    }

    // Get bookings
    console.log('Fetching bookings...');
    const bookingsRes = await api.get('/bookings');
    const bookings = bookingsRes.data;
    
    if (bookings.length === 0) {
      console.log('No bookings found.');
      return;
    }

    const booking = bookings[0];
    console.log('Updating booking:', booking._id);

    // Update booking
    const updateRes = await api.put(`/bookings/${booking._id}`, { bookingStatus: 'Approved' });
    console.log('Success:', updateRes.data);
  } catch (err) {
    console.error('Error occurred:', err.response ? err.response.data : err.message);
  }
}

run();
