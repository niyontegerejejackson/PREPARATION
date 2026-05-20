const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Guest', guestSchema);
