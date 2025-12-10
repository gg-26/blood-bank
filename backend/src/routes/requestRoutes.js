const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getRequests, 
  getRequestById, 
  updateRequest, 
  fulfillRequest 
} = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateRequest } = require('../middleware/validate');

router.post('/', authenticateToken, authorize('hospital', 'donor'), validateRequest, createRequest);
router.get('/', authenticateToken, getRequests);
router.get('/:id', authenticateToken, getRequestById);
router.put('/:id', authenticateToken, updateRequest);
router.post('/:id/fulfill', authenticateToken, authorize('hospital', 'admin'), fulfillRequest);

module.exports = router;

