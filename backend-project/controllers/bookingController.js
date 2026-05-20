const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Add a new booking
// @route   POST /api/bookings
// @access  Private (Client)
const addBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, totalAmount, userId } = req.body;

    let bookingUserId = req.user._id;
    let finalStatus = 'Pending';

    // If Admin is booking for a client, use provided userId and approve it
    if (req.user.role === 'Admin' && userId) {
      bookingUserId = userId;
      finalStatus = 'Approved';
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      room,
      bookingStatus: { $in: ['Pending', 'Approved'] },
      $or: [
        { checkInDate: { $lt: new Date(checkOutDate) }, checkOutDate: { $gt: new Date(checkInDate) } }
      ]
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({ message: 'This room is already booked for these dates' });
    }

    const booking = await Booking.create({
      user: bookingUserId, // Client ID from token or Admin's selection
      room,
      checkInDate,
      checkOutDate,
      totalAmount,
      bookingStatus: finalStatus,
      paymentStatus: 'Pending'
    });

    // If approved immediately (by Admin), update Room status
    if (finalStatus === 'Approved') {
      await Room.findByIdAndUpdate(room, { status: 'Occupied' });
    }

    // Notify Admin
    const admin = await User.findOne({ role: 'Admin' });
    if (admin) {
      const roomDetails = await Room.findById(room);
      await Notification.create({
        user: admin._id,
        message: `${req.user.username} has requested to book Room ${roomDetails.roomNumber}.`
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings
// @route   GET /api/bookings
// @access  Private (Admin gets all, Client gets own)
const getBookings = async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'Admin') {
      bookings = await Booking.find({})
        .populate('user', 'username email')
        .populate('room', 'roomNumber roomType pricePerNight image');
    } else {
      bookings = await Booking.find({ user: req.user._id })
        .populate('room', 'roomNumber roomType pricePerNight image');
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update/Approve booking
// @route   PUT /api/bookings/:id
// @access  Private (Admin)
const updateBooking = async (req, res) => {
  try {
    const { bookingStatus } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.bookingStatus = bookingStatus || booking.bookingStatus;

      // If approved, mark room as Occupied (simplified logic)
      if (bookingStatus === 'Approved') {
        await Room.findByIdAndUpdate(booking.room, { status: 'Occupied' });
      } else if (bookingStatus === 'Cancelled') {
        await Room.findByIdAndUpdate(booking.room, { status: 'Available' });
      }

      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete/Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Private (Client can cancel if pending, Admin can delete)
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (req.user.role === 'Client') {
      // Client can only cancel their own pending booking
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      if (booking.bookingStatus !== 'Pending') {
        return res.status(400).json({ message: 'Cannot delete a booking that has already been approved' });
      }
    }

    await Room.findByIdAndUpdate(booking.room, { status: 'Available' });
    await Booking.deleteOne({ _id: booking._id });
    res.json({ message: 'Booking removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check out a guest from a booking
// @route   POST /api/bookings/:id/checkout
// @access  Private (Admin)
const checkoutBooking = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const logActivity = require('../utils/auditLogger');

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'username email')
      .populate('room');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Calculate unpaid balance
    const payments = await Payment.find({ booking: booking._id });
    const totalPaid = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const balance = booking.totalAmount - totalPaid;

    const preventUnpaidCheckout = req.query.preventUnpaidCheckout !== 'false';

    if (balance > 0 && preventUnpaidCheckout) {
      await logActivity('CHECKOUT_PREVENTED', req.user._id, `Checkout blocked for Room ${booking.room?.roomNumber} due to outstanding balance of $${balance}`, req.ip);
      
      // Notify Admin
      await Notification.create({
        user: req.user._id,
        message: `Checkout blocked for Room ${booking.room?.roomNumber} due to outstanding balance of $${balance}.`
      });

      return res.status(400).json({
        message: `Checkout blocked: Guest has an outstanding unpaid balance of $${balance}. Please clear the balance first.`
      });
    }

    // Set room to Available
    if (booking.room) {
      await Room.findByIdAndUpdate(booking.room._id, { status: 'Available' });
    }

    // Log action
    await logActivity('CHECKOUT_SUCCESS', req.user._id, `Checked out Room ${booking.room?.roomNumber}. Outstanding debt recorded: $${Math.max(0, balance)}`, req.ip);

    // Notify guest
    await Notification.create({
      user: booking.user._id,
      message: `You have successfully checked out from Room ${booking.room?.roomNumber}. Thank you for staying with us!`
    });

    res.json({
      success: true,
      message: `Checked out successfully. Room ${booking.room?.roomNumber} is now Available.`,
      balance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addBooking, getBookings, updateBooking, deleteBooking, checkoutBooking };
