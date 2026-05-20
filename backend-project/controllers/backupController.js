const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const logActivity = require('../utils/auditLogger');

const BACKUP_DIR = path.join(__dirname, '../uploads/backups');

// Ensure backup folder exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// @desc    Create database backup
// @route   POST /api/backup
// @access  Private/Admin
const createBackup = async (req, res) => {
  try {
    const [users, rooms, bookings, payments, notifications, auditLogs] = await Promise.all([
      User.find({}),
      Room.find({}),
      Booking.find({}),
      Payment.find({}),
      Notification.find({}),
      AuditLog.find({})
    ]);

    const backupData = {
      users,
      rooms,
      bookings,
      payments,
      notifications,
      auditLogs,
      timestamp: new Date().toISOString()
    };

    const fileName = `backup_${Date.now()}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    await logActivity('BACKUP_CREATED', req.user._id, `Created database backup archive: ${fileName}`, req.ip);

    res.status(201).json({
      success: true,
      message: 'Backup created successfully',
      file: fileName
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List available backups
// @route   GET /api/backup
// @access  Private/Admin
const listBackups = async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const stats = fs.statSync(path.join(BACKUP_DIR, file));
        return {
          fileName: file,
          createdAt: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(backups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Restore database from backup
// @route   POST /api/backup/restore
// @access  Private/Admin
const restoreBackup = async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ message: 'Backup file name is required' });
    }

    const filePath = path.join(BACKUP_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Backup file not found' });
    }

    const rawData = fs.readFileSync(filePath, 'utf-8');
    const backup = JSON.parse(rawData);

    // Overwrite collections
    if (backup.users) {
      await User.deleteMany({});
      await User.insertMany(backup.users);
    }
    if (backup.rooms) {
      await Room.deleteMany({});
      await Room.insertMany(backup.rooms);
    }
    if (backup.bookings) {
      await Booking.deleteMany({});
      await Booking.insertMany(backup.bookings);
    }
    if (backup.payments) {
      await Payment.deleteMany({});
      await Payment.insertMany(backup.payments);
    }
    if (backup.notifications) {
      await Notification.deleteMany({});
      await Notification.insertMany(backup.notifications);
    }
    if (backup.auditLogs) {
      await AuditLog.deleteMany({});
      await AuditLog.insertMany(backup.auditLogs);
    }

    await logActivity('BACKUP_RESTORED', req.user._id, `Restored database state from: ${fileName}`, req.ip);

    res.json({
      success: true,
      message: 'Database state restored successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a backup file
// @route   DELETE /api/backup/:fileName
// @access  Private/Admin
const deleteBackup = async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(BACKUP_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      await logActivity('BACKUP_DELETED', req.user._id, `Deleted backup archive file: ${fileName}`, req.ip);
      res.json({ message: 'Backup file deleted successfully' });
    } else {
      res.status(404).json({ message: 'Backup file not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBackup, listBackups, restoreBackup, deleteBackup };
