const express = require('express');
const router = express.Router();
const { createBackup, listBackups, restoreBackup, deleteBackup } = require('../controllers/backupController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(listBackups)
  .post(createBackup);

router.post('/restore', restoreBackup);
router.delete('/:fileName', deleteBackup);

module.exports = router;
