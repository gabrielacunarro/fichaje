const express = require('express');
const router = express.Router();
const path = require('path');
const { login, recuperarPassword, resetPassword } = require('../controllers/authController.js');

router.post('/login', login);
router.post('/reset', recuperarPassword);
router.post('/reset/:token', resetPassword);
router.post('/forgot', recuperarPassword);

router.get('/reset', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'reset.html'));
});

module.exports = router;
