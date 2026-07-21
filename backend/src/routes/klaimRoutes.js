const express = require('express');
const router = express.Router();
const klaimController = require('../controllers/klaimController');
const { verifyToken, requireRole, optionalAuth } = require('../middleware/auth');

// Public - Create klaim (passengers can claim without login)
router.post('/', optionalAuth, klaimController.createKlaim);

// Protected - Admin routes
router.get('/', verifyToken, requireRole('ADMIN_PUSAT', 'ADMIN_STASIUN'), klaimController.getAllKlaim);
router.get('/my', verifyToken, klaimController.getMyKlaim);
router.get('/:id', verifyToken, klaimController.getKlaimById);
router.put('/:id/verify', verifyToken, requireRole('ADMIN_PUSAT', 'ADMIN_STASIUN'), klaimController.verifyKlaim);
router.post('/:id/confirm', verifyToken, requireRole('ADMIN_PUSAT', 'ADMIN_STASIUN'), klaimController.confirmPickup);

module.exports = router;
