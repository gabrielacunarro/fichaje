const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'Sesión expirada, por favor inicie sesión nuevamente.' }); // token no proporcionado

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Sesión expirada, por favor inicie sesión nuevamente.' }); // token inválido

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuarioId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Sesión expirada, por favor inicie sesión nuevamente.' }); // token expirado
  }
};

module.exports = { validarToken };
