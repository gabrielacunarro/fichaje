const express = require('express');
const router = express.Router();
const Ubicacion = require('../models/Ubicacion');
const { validarToken } = require('../middlewares/authMiddleware.js');
const protegerAdmin = require('../middlewares/adminMiddleware.js');

// POST /api/ubicaciones
router.post('/', validarToken , protegerAdmin ,async (req, res) => {
  const { nombre, lat, lng } = req.body;

  if (!nombre || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const nuevaUbicacion = new Ubicacion({ nombre, lat, lng });
    await nuevaUbicacion.save();
    res.status(201).json({ mensaje: 'Ubicación guardada', data: nuevaUbicacion });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar ubicación' });
  }
});

module.exports = router;
