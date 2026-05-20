const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true
  },
  roomType: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: '/uploads/default-room.jpg'
  }
}, { timestamps: true });


roomSchema.index({ status: 1 });

module.exports = mongoose.model('Room', roomSchema);
