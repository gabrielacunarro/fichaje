const express = require('express');
const router = express.Router();
const { login, recuperarPassword, resetPassword } = require('../controllers/authController.js');

router.post('/login', login);
router.post('/reset', recuperarPassword);
router.post('/reset/:token', resetPassword);
router.post('/forgot', recuperarPassword);


module.exports = router;
