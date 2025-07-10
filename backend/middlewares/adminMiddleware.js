function protegerAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "No autorizado" });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Acceso denegado, no eres admin" });
  }

  next();
}

module.exports = protegerAdmin;
