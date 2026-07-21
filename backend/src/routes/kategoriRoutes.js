const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Public routes
router.get('/', kategoriController.getAllKategori);
router.get('/:id', kategoriController.getKategoriById);

// Protected routes (admin only)
router.post('/', verifyToken, requireRole('ADMIN_PUSAT'), kategoriController.createKategori);
router.put('/:id', verifyToken, requireRole('ADMIN_PUSAT'), kategoriController.updateKategori);
router.delete('/:id', verifyToken, requireRole('ADMIN_PUSAT'), kategoriController.deleteKategori);

module.exports = router;
