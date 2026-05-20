const express = require('express');
const router = express.Router();
const { addGuest, getGuests } = require('../controllers/guestController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addGuest).get(protect, getGuests);

module.exports = router;
