const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const validarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) 
    return res.status(401).json({ success: false, message: 'Sesión expirada, por favor inicie sesión nuevamente.' });

  const token = authHeader.split(' ')[1];
  if (!token) 
    return res.status(401).json({ success: false, message: 'Sesión expirada, por favor inicie sesión nuevamente.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) 
      return res.status(401).json({ success: false, message: 'Datos inválidos, reintente.' });

    req.user = usuario;  // Aquí es crucial para que protegerAdmin funcione
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Sesión expirada, por favor inicie sesión nuevamente.' });
  }
};

module.exports = { validarToken };
