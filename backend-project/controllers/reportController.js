const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Room = require('../models/Room');
const User = require('../models/User'); // Required to register schema before Mongoose populate runs
// @desc    Generate Guest Bill for a Booking
// @route   GET /api/reports/guest-bill/:bookingId
// @access  Private
const getGuestBill = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('user', 'username email')
      .populate('room');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const payments = await Payment.find({ booking: booking._id })
      .populate('receivedBy', 'username');

    const totalPaid = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const balance = booking.totalAmount - totalPaid;

    res.json({
      booking,
      payments,
      summary: {
        totalAmount: booking.totalAmount,
        totalPaid,
        balance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate Daily Room Booking Report
// @route   GET /api/reports/daily-bookings
// @access  Private
const getDailyBookings = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await Booking.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate('user', 'username email')
    .populate('room', 'roomNumber roomType pricePerNight');

    res.json({
      date: new Date().toISOString().split('T')[0],
      totalBookings: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Analytics for Dashboard (Recharts)
// @route   GET /api/reports/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });
    
    // Monthly Revenue for chart
    const payments = await Payment.find();
    const monthlyRevenue = [0,0,0,0,0,0,0,0,0,0,0,0]; // Jan - Dec
    payments.forEach(p => {
      const month = new Date(p.paymentDate).getMonth();
      monthlyRevenue[month] += p.amountPaid;
    });

    // Calculate total pending loans
    const allBookings = await Booking.find({ bookingStatus: 'Approved' });
    let totalPendingLoans = 0;
    for (const b of allBookings) {
      const bPayments = await Payment.find({ booking: b._id });
      const totalPaid = bPayments.reduce((acc, curr) => acc + curr.amountPaid, 0);
      totalPendingLoans += Math.max(0, b.totalAmount - totalPaid);
    }

    const chartData = [
      { name: 'Jan', revenue: monthlyRevenue[0] },
      { name: 'Feb', revenue: monthlyRevenue[1] },
      { name: 'Mar', revenue: monthlyRevenue[2] },
      { name: 'Apr', revenue: monthlyRevenue[3] },
      { name: 'May', revenue: monthlyRevenue[4] },
      { name: 'Jun', revenue: monthlyRevenue[5] },
      { name: 'Jul', revenue: monthlyRevenue[6] },
      { name: 'Aug', revenue: monthlyRevenue[7] },
      { name: 'Sep', revenue: monthlyRevenue[8] },
      { name: 'Oct', revenue: monthlyRevenue[9] },
      { name: 'Nov', revenue: monthlyRevenue[10] },
      { name: 'Dec', revenue: monthlyRevenue[11] }
    ];

    res.json({
      stats: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        totalRevenue: payments.reduce((acc, curr) => acc + curr.amountPaid, 0),
        totalPendingLoans
      },
      chartData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Get Daily Income Report
// @route   GET /api/reports/daily-income
// @access  Private (Admin)
const getDailyIncome = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      paymentDate: { $gte: startOfDay, $lte: endOfDay }
    })
    .populate({
      path: 'booking',
      populate: [
        { path: 'user', select: 'username email' },
        { path: 'room', select: 'roomNumber roomType' }
      ]
    })
    .populate('receivedBy', 'username');

    const totalIncome = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);

    res.json({
      date: new Date().toISOString().split('T')[0],
      totalIncome,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Pending Payments (Loans) Report
// @route   GET /api/reports/pending-payments
// @access  Private (Admin)
const getPendingPayments = async (req, res) => {
  try {
    const bookings = await Booking.find({
      bookingStatus: 'Approved',
      paymentStatus: { $in: ['Pending', 'Partial'] }
    })
    .populate('user', 'username email')
    .populate('room', 'roomNumber roomType pricePerNight');

    const pendingReport = [];
    let totalPendingAmount = 0;

    for (const booking of bookings) {
      const bPayments = await Payment.find({ booking: booking._id });
      const totalPaid = bPayments.reduce((acc, curr) => acc + curr.amountPaid, 0);
      const balance = booking.totalAmount - totalPaid;

      if (balance > 0) {
        pendingReport.push({
          bookingId: booking._id,
          user: booking.user,
          room: booking.room,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          totalAmount: booking.totalAmount,
          totalPaid,
          balance
        });
        totalPendingAmount += balance;
      }
    }

    res.json({
      totalPendingAmount,
      count: pendingReport.length,
      bookings: pendingReport
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Customer Transaction History
// @route   GET /api/reports/customer-transactions
// @access  Private (Admin gets all or specific, Client gets own)
const getCustomerTransactions = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'Client') {
      filter = { user: req.user._id };
    } else if (req.query.userId) {
      filter = { user: req.query.userId };
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'username email')
      .populate('room', 'roomNumber roomType pricePerNight');

    const result = [];

    for (const booking of bookings) {
      const bPayments = await Payment.find({ booking: booking._id })
        .populate('receivedBy', 'username');
      const totalPaid = bPayments.reduce((acc, curr) => acc + curr.amountPaid, 0);
      const balance = booking.totalAmount - totalPaid;

      result.push({
        bookingId: booking._id,
        user: booking.user,
        room: booking.room,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalAmount: booking.totalAmount,
        totalPaid,
        balance,
        payments: bPayments
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Room Occupancy Statistics
// @route   GET /api/reports/room-stats
// @access  Private (Admin)
const getRoomStats = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      occupancyRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGuestBill,
  getDailyBookings,
  getAnalytics,
  getDailyIncome,
  getPendingPayments,
  getCustomerTransactions,
  getRoomStats
};
