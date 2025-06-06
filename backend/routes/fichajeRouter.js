const express = require('express');
const router = express.Router();
const { validarToken } = require('../middlewares/authMiddleware');
const { fichar } = require('../controllers/fichajeController.js');

router.post('/', validarToken, fichar);

module.exports = router;
