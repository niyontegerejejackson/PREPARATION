const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

// @desc    Add a new payment
// @route   POST /api/payments
// @access  Private
const addPayment = async (req, res) => {
  try {
    const { booking, amountPaid } = req.body;

    const payment = await Payment.create({
      booking,
      amountPaid,
      receivedBy: req.user._id
    });

    // Update booking payment status based on logic
    // For simplicity, just marking as Paid if total match, else Partial.
    const currentBooking = await Booking.findById(booking);
    if(currentBooking) {
        const allPayments = await Payment.find({ booking: booking });
        const totalPaidSoFar = allPayments.reduce((acc, curr) => acc + curr.amountPaid, 0);
        
        if (totalPaidSoFar >= currentBooking.totalAmount) {
            currentBooking.paymentStatus = 'Paid';
        } else {
            currentBooking.paymentStatus = 'Partial';
        }
        await currentBooking.save();
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: 'booking',
        populate: [
          { path: 'user', select: 'username email' },
          { path: 'room', select: 'roomNumber' }
        ]
      })
      .populate('receivedBy', 'username');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('receivedBy', 'username');
    if (payment) {
      res.json(payment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = async (req, res) => {
  try {
    const { amountPaid } = req.body;
    
    const payment = await Payment.findById(req.params.id);

    if (payment) {
      payment.amountPaid = amountPaid || payment.amountPaid;

      const updatedPayment = await payment.save();

      // Recalculate Booking payment status
      const currentBooking = await Booking.findById(payment.booking);
      if(currentBooking) {
          const allPayments = await Payment.find({ booking: payment.booking });
          const totalPaidSoFar = allPayments.reduce((acc, curr) => acc + curr.amountPaid, 0);
          
          if (totalPaidSoFar >= currentBooking.totalAmount) {
              currentBooking.paymentStatus = 'Paid';
          } else {
              currentBooking.paymentStatus = 'Partial';
          }
          await currentBooking.save();
      }

      res.json(updatedPayment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (payment) {
      await Payment.deleteOne({ _id: payment._id });
      res.json({ message: 'Payment removed' });
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addPayment, getPayments, getPaymentById, updatePayment, deletePayment };
