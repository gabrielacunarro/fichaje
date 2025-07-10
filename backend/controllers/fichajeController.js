const Fichaje = require("../models/Fichaje");
const Ubicacion = require("../models/Ubicacion");
const Jornada = require("../models/Jornada");
const Usuario = require("../models/Usuario");

// 🔵 Calcula la distancia en metros entre dos coordenadas GPS
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 🔵 Busca ubicación válida
const obtenerUbicacionValida = async (lat, lng) => {
  const ubicaciones = await Ubicacion.find();
  const umbralMetros = 150;

  for (const u of ubicaciones) {
    const distancia = calcularDistancia(u.lat, u.lng, lat, lng);
    if (distancia <= umbralMetros) {
      return u;
    }
  }
  return null;
};

// 🔵 Registro Check In / Check Out
exports.fichar = async (req, res) => {
  try {
    const usuarioId = req.user._id; // 🚨 SIN toString()

    const { tipo, lat, lng } = req.body;

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res.status(400).json({ success: false, message: "Ubicación inválida" });
    }

    const ubicacion = await obtenerUbicacionValida(latNum, lngNum);

    if (!ubicacion) {
      return res.status(400).json({ success: false, message: "Ubicación inválida" });
    }

    const ubicacionConNombre = {
      nombre: ubicacion.nombre,
      lat: ubicacion.lat,
      lng: ubicacion.lng,
    };

    const ultimoFichaje = await Fichaje.findOne({ usuarioId }).sort({ createdAt: -1 });

    if (tipo === "checkin") {
      if (ultimoFichaje && ultimoFichaje.tipo === "checkin") {
        return res.status(400).json({
          success: false,
          message: "Ya existe un Check In sin Check Out",
        });
      }

      await Fichaje.create({ usuarioId, tipo, ubicacion: ubicacionConNombre });

      return res.json({ success: true, message: "Check In registrado" });
    }

    if (tipo === "checkout") {
      if (!ultimoFichaje || ultimoFichaje.tipo !== "checkin") {
        return res
          .status(400)
          .json({ success: false, message: "No se encontró Check In previo" });
      }

      const distanciaCheck = calcularDistancia(
        ultimoFichaje.ubicacion.lat,
        ultimoFichaje.ubicacion.lng,
        latNum,
        lngNum
      );

      if (distanciaCheck > 100) {
        return res.status(400).json({
          success: false,
          message: "Check Out en ubicación distinta al Check In",
        });
      }

      const horas =
        (Date.now() - new Date(ultimoFichaje.createdAt)) / 1000 / 60 / 60;

      // ✅ Registrar el Fichaje de Check Out
      await Fichaje.create({
        usuarioId,
        tipo,
        ubicacion: ubicacionConNombre,
        horasTrabajadas: horas,
      });

      // ✅ Crear Jornada completa SOLO aquí
      await Jornada.create({
        usuarioId,
        fecha: new Date(ultimoFichaje.createdAt), // fecha de entrada
        checkOut: new Date(), // fecha de salida actual
        horasTrabajadas: horas,
        ubicacion: ubicacionConNombre,
      });

      return res.json({
        success: true,
        message: "Check Out registrado y jornada creada",
        horas,
      });
    }

    res.status(400).json({ success: false, message: "Tipo inválido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};


// 🔵 Listar jornadas laborales
exports.listarJornadas = async (req, res) => {
  try {
    const nombre = req.query.nombre || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    let filtro = {};
    if (nombre) {
      const usuarios = await Usuario.find({
        nombre: { $regex: nombre, $options: "i" },
      }).select("_id").lean();

      const ids = usuarios.map((u) => u._id);
      filtro = { usuarioId: { $in: ids } };
    }

    const total = await Jornada.countDocuments(filtro);

    const jornadas = await Jornada.find(filtro)
      .populate("usuarioId", "nombre")
      .sort({ fecha: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const jornadasConNombre = jornadas.map((j) => ({
      ...j,
      nombreEmpleado: j.usuarioId?.nombre || "N/A",
    }));

    res.json({
      jornadas: jornadasConNombre,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener jornadas" });
  }
};

// 🔵 Listar fichajes
exports.listarFichajes = async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const filtro = usuarioId ? { usuarioId } : {};

    const fichajes = await Fichaje.find(filtro)
      .populate("usuarioId", "nombre email")
      .sort({ createdAt: -1 })
      .lean();

    const fichajesConNombre = fichajes.map((f) => ({
      ...f,
      nombreUsuario: f.usuarioId?.nombre || "Desconocido",
      emailUsuario: f.usuarioId?.email || "",
    }));

    res.json(fichajesConNombre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener fichajes" });
  }
};
