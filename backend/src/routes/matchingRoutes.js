const express = require('express');
const router = express.Router();
const { findNearbyDonors, getMatchingSuggestions } = require('../controllers/matchingController');
const { authenticateToken } = require('../middleware/authenticate');

router.post('/donors/nearby', authenticateToken, findNearbyDonors);
router.get('/suggestions/:requestId', authenticateToken, getMatchingSuggestions);

module.exports = router;

