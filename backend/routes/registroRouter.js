const express = require('express');
const router = express.Router();
const { registrarUsuario } = require('../controllers/registroController.js');

router.post('/', registrarUsuario);

module.exports = router;

