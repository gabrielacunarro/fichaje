function protegerSesion(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login'); // Si no hay sesión, redirige a login
  }
  next();
}

module.exports = { protegerSesion };
