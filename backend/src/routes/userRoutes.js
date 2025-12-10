const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getUserById, getAllUsers, getDonorStats } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/:id', authenticateToken, getUserById);
router.get('/', authenticateToken, authorize('admin'), getAllUsers);
router.get('/donors/stats', authenticateToken, authorize('admin', 'hospital'), getDonorStats);

module.exports = router;

