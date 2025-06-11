const express = require('express');
const router = express.Router();
const { login, recuperarPassword, resetPassword } = require('../controllers/authController.js');

router.post('/login', login);
router.post('/recuperar', recuperarPassword);
router.post('/reset/:token', resetPassword);


module.exports = router;
