const admins = ['gabiicai17@gmail.com', 'aleelcharobolso1899@hotmail.com'];

function protegerAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autorizado' });
  }

  if (!admins.includes(req.user.email.toLowerCase())) {
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
  next();
}

module.exports = protegerAdmin;
