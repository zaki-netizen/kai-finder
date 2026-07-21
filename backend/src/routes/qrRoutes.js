const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/notifikasiController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Generate QR Code for a barang
router.get('/:id', verifyToken, requireRole('PETUGAS', 'ADMIN_PUSAT', 'ADMIN_STASIUN'), notifikasiController.generateQRCode);

module.exports = router;
