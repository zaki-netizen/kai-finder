const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');

// Search matching items
router.get('/search', matchingController.searchMatching);

module.exports = router;
