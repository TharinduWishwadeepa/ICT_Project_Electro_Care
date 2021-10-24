const express = require('express');
const authController = require('../controllers/user_auth_control');
const router = express.Router();

router.post('/register',authController.register);
router.post('/login',authController.login);
router.get('/logout', authController.logout);

module.exports = router;