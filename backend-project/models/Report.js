const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    required: true // e.g., 'Daily Booking', 'Monthly Income', 'Occupancy'
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Store flexible JSON report data
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
