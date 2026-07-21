const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middleware/auth');

// All routes require authentication and ADMIN_PUSAT role
router.use(verifyToken);
router.use(requireRole('ADMIN_PUSAT'));

// Routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.changeUserPassword);
router.delete('/:id', userController.deleteUser);

module.exports = router;
