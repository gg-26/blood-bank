const express = require('express');
const router = express.Router();
const { register, login, refresh, logout } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { authenticateToken } = require('../middleware/authenticate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', authenticateToken, logout);

module.exports = router;

