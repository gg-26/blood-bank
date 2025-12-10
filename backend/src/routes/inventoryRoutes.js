const express = require('express');
const router = express.Router();
const { 
  getInventory, 
  addBloodUnit, 
  updateBloodUnit, 
  getExpiringUnits, 
  getLowStock 
} = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateBloodInventory } = require('../middleware/validate');

router.get('/', authenticateToken, getInventory);
router.post('/', authenticateToken, authorize('hospital', 'admin'), validateBloodInventory, addBloodUnit);
router.put('/:id', authenticateToken, authorize('hospital', 'admin'), updateBloodUnit);
router.get('/expiring', authenticateToken, getExpiringUnits);
router.get('/low-stock', authenticateToken, getLowStock);

module.exports = router;

