const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public stats (for display boards)
router.get('/dashboard', statsController.getDashboardStats);
router.get('/barang', statsController.getBarangStats);
router.get('/klaim', statsController.getKlaimStats);

// Protected routes
router.get('/export', verifyToken, requireRole('ADMIN_PUSAT', 'ADMIN_STASIUN'), statsController.exportReport);

module.exports = router;
