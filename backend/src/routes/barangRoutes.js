const express = require('express');
const router = express.Router();
const barangController = require('../controllers/barangController');
const { verifyToken, requireRole, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/', optionalAuth, barangController.getAllBarang);
router.get('/krl', optionalAuth, barangController.getBarangKRL);
router.get('/kai', optionalAuth, barangController.getBarangKA);
router.get('/:id', optionalAuth, barangController.getBarangById);

// Protected routes
router.post('/', verifyToken, requireRole('PETUGAS', 'ADMIN_PUSAT', 'ADMIN_STASIUN'), barangController.createBarang);
router.put('/:id', verifyToken, requireRole('PETUGAS', 'ADMIN_PUSAT', 'ADMIN_STASIUN'), barangController.updateBarang);
router.delete('/:id', verifyToken, requireRole('ADMIN_PUSAT', 'ADMIN_STASIUN'), barangController.deleteBarang);
router.put('/:id/status', verifyToken, requireRole('PETUGAS', 'ADMIN_PUSAT', 'ADMIN_STASIUN'), barangController.updateStatusBarang);

module.exports = router;
