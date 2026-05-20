const AuditLog = require('../models/AuditLog');

const logActivity = async (action, userId, details, ipAddress = '') => {
  try {
    await AuditLog.create({
      action,
      user: userId || null,
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Audit Log failed:', error.message);
  }
};

module.exports = logActivity;
