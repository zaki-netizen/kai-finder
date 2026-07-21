const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/notifikasiController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Notifications (authenticated user)
router.get('/', verifyToken, notifikasiController.getNotifications);
router.put('/:id/read', verifyToken, notifikasiController.markAsRead);
router.put('/read-all', verifyToken, notifikasiController.markAllAsRead);
router.delete('/:id', verifyToken, notifikasiController.deleteNotification);

// Audit Log (admin only)
router.get('/audit-log', verifyToken, requireRole('ADMIN_PUSAT', 'ADMIN_STASIUN'), notifikasiController.getAuditLog);

module.exports = router;
