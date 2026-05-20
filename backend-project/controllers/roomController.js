const Room = require('../models/Room');
const logActivity = require('../utils/auditLogger');

// @desc    Add a new room
// @route   POST /api/rooms
// @access  Private/Admin
const addRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, pricePerNight, status, description, image } = req.body;

    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    const room = await Room.create({
      roomNumber,
      roomType,
      pricePerNight,
      status,
      description,
      image
    });

    await logActivity('ROOM_ADDED', req.user._id, `Added new Room ${roomNumber} (${roomType})`, req.ip);

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public (Clients need to see available rooms)
const getRooms = async (req, res) => {
  try {
    // If query ?available=true, filter
    const filter = req.query.available ? { status: 'Available' } : {};
    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    await logActivity('ROOM_UPDATED', req.user._id, `Updated Room ${room.roomNumber} - status: ${room.status}`, req.ip);
    res.json(room);
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
}

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const roomNum = room.roomNumber;
    await Room.deleteOne({ _id: room._id });
    await logActivity('ROOM_DELETED', req.user._id, `Deleted Room ${roomNum}`, req.ip);
    res.json({ message: 'Room deleted' });
  } catch(error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { addRoom, getRooms, updateRoom, deleteRoom };
