const Guest = require('../models/Guest');

// @desc    Add a new guest
// @route   POST /api/guests
// @access  Private
const addGuest = async (req, res) => {
  try {
    const { fullName, phone, email } = req.body;

    const guest = await Guest.create({
      fullName,
      phone,
      email
    });

    res.status(201).json(guest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all guests
// @route   GET /api/guests
// @access  Private
const getGuests = async (req, res) => {
  try {
    const guests = await Guest.find({});
    res.json(guests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addGuest, getGuests };
