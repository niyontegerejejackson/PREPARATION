const express = require('express');
const router = express.Router();
const { addRoom, getRooms, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.route('/')
  .post(protect, adminOnly, addRoom)
  .get(getRooms); // Public so landing page and clients can see rooms

router.route('/:id')
  .put(protect, adminOnly, updateRoom)
  .delete(protect, adminOnly, deleteRoom);

// Image Upload Route
router.post('/upload', protect, adminOnly, upload.single('image'), (req, res) => {
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

module.exports = router;
