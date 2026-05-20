const express = require('express');
const router = express.Router();
const { addBooking, getBookings, updateBooking, deleteBooking, checkoutBooking } = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addBooking)
  .get(protect, getBookings);

router.post('/:id/checkout', protect, adminOnly, checkoutBooking);

router.route('/:id')
  .put(protect, adminOnly, updateBooking) // Only Admin can update status
  .delete(protect, deleteBooking); // Delete checks roles inside controller

module.exports = router;
