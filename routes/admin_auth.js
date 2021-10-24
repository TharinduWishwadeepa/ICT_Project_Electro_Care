const express = require('express');
const authController = require('../controllers/admin_auth_control');
const router = express.Router();

router.post('/login',authController.login);
router.get('/logout', authController.logout);

module.exports = router;