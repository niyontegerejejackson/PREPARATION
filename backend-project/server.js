const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const sanitizeInput = require('./middleware/sanitizer');
const preventCache = require('./middleware/cacheControl');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeInput);
app.use(preventCache);
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:3000', 'http://127.0.0.1:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true
}));

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/guests', require('./routes/guestRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/backup', require('./routes/backupRoutes'));

const runAutoCheckout = async () => {
  try {
    const Booking = require('./models/Booking');
    const Room = require('./models/Room');
    const Payment = require('./models/Payment');
    const Notification = require('./models/Notification');
    const User = require('./models/User');
    const logActivity = require('./utils/auditLogger');

    const now = new Date();
    
    // Find Approved bookings whose checkout date has passed and the room is occupied
    const activeBookings = await Booking.find({
      bookingStatus: 'Approved',
      checkOutDate: { $lte: now }
    }).populate('room').populate('user');

    for (const booking of activeBookings) {
      if (!booking.room || booking.room.status !== 'Occupied') continue;

      // Calculate balance
      const payments = await Payment.find({ booking: booking._id });
      const totalPaid = payments.reduce((acc, curr) => acc + curr.amountPaid, 0);
      const balance = booking.totalAmount - totalPaid;

      const preventUnpaidCheckout = true; // Business rules enforce this globally for automated checks

      if (balance > 0 && preventUnpaidCheckout) {
        // Block checkout, notify admin and guest
        const admin = await User.findOne({ role: 'Admin' });
        if (admin) {
          const alreadyNotified = await Notification.findOne({
            user: admin._id,
            message: new RegExp(`Auto-checkout BLOCKED for Room ${booking.room.roomNumber}`)
          });
          if (!alreadyNotified) {
            await Notification.create({
              user: admin._id,
              message: `Auto-checkout BLOCKED for Room ${booking.room.roomNumber} (${booking.user?.username}) due to unpaid balance of $${balance}.`
            });
            await logActivity('AUTO_CHECKOUT_BLOCKED', null, `Auto-checkout blocked for Room ${booking.room.roomNumber} - outstanding balance: $${balance}`);
          }
        }
        
        if (booking.user) {
          const guestAlreadyNotified = await Notification.findOne({
            user: booking.user._id,
            message: /settle your unpaid balance/
          });
          if (!guestAlreadyNotified) {
            await Notification.create({
              user: booking.user._id,
              message: `Your stay in Room ${booking.room.roomNumber} has ended. Please settle your unpaid balance of $${balance} to complete checkout.`
            });
          }
        }
      } else {
        // Free the room
        await Room.findByIdAndUpdate(booking.room._id, { status: 'Available' });
        
        // Notify admin and guest
        const admin = await User.findOne({ role: 'Admin' });
        if (admin) {
          await Notification.create({
            user: admin._id,
            message: `Auto-checkout SUCCESS for Room ${booking.room.roomNumber} (${booking.user?.username}).`
          });
        }
        if (booking.user) {
          await Notification.create({
            user: booking.user._id,
            message: `You have been automatically checked out from Room ${booking.room.roomNumber}. Thank you for staying!`
          });
        }

        await logActivity('AUTO_CHECKOUT_SUCCESS', null, `Auto-checkout succeeded for Room ${booking.room.roomNumber}`);
      }
    }
  } catch (err) {
    console.error('Error in auto-checkout background job:', err.message);
  }
};

// Start background cron jobs (check every 30s)
setInterval(runAutoCheckout, 30000);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
