const express = require('express');
const router = express.Router();
const { addPayment, getPayments, getPaymentById, updatePayment, deletePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addPayment)
  .get(protect, getPayments);

router.route('/:id')
  .get(protect, getPaymentById)
  .put(protect, updatePayment)
  .delete(protect, deletePayment);

module.exports = router;
