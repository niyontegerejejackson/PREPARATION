const express = require('express');
const router = express.Router();
const { 
  getGuestBill, 
  getDailyBookings, 
  getAnalytics,
  getDailyIncome,
  getPendingPayments,
  getCustomerTransactions,
  getRoomStats
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/guest-bill/:bookingId', protect, getGuestBill);
router.get('/daily-bookings', protect, adminOnly, getDailyBookings);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/daily-income', protect, adminOnly, getDailyIncome);
router.get('/pending-payments', protect, adminOnly, getPendingPayments);
router.get('/customer-transactions', protect, getCustomerTransactions); // Available to client (gets own) and admin
router.get('/room-stats', protect, adminOnly, getRoomStats);

module.exports = router;
