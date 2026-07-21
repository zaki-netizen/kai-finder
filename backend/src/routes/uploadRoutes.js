const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { upload } = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');

// Upload routes
router.post('/foto', verifyToken, upload.array('files', 5), uploadController.uploadFotoBarang);
router.delete('/foto/:id', verifyToken, uploadController.deleteFoto);
router.post('/foto-klaim', upload.array('files', 2), uploadController.uploadFotoKlaim);

module.exports = router;
