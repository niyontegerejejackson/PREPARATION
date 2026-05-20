const express = require('express');
const router = express.Router();
const { loginUser, registerUser, logoutUser, forgotPassword, resetPassword, getClients, getAuditLogs } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/logout', logoutUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);
router.get('/clients', protect, adminOnly, getClients);
router.get('/audit-logs', protect, adminOnly, getAuditLogs);

module.exports = router;
