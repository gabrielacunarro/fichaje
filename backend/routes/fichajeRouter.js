const express = require("express");
const router = express.Router();
const { validarToken } = require("../middlewares/authMiddleware");
const protegerAdmin = require("../middlewares/adminMiddleware");
const fichajeController = require("../controllers/fichajeController");

// Ruta para fichar (checkin/checkout)
router.post("/", validarToken, fichajeController.fichar);

// Ruta para listar jornadas (ordenadas)
router.get(
  "/jornadas",
  validarToken,
  protegerAdmin,
  fichajeController.listarJornadas
);

// Ruta para listar fichajes (ordenados)
router.get("/fichajes", validarToken, fichajeController.listarFichajes);

module.exports = router;
