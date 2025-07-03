const Fichaje = require("../models/Fichaje");
const Ubicacion = require("../models/Ubicacion");
const Jornada = require("../models/Jornada");
const Usuario = require("../models/Usuario");

// Calcula la distancia en metros entre dos coordenadas GPS
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

// Devuelve la ubicación válida encontrada (incluye nombre)
const obtenerUbicacionValida = async (lat, lng) => {
  const ubicaciones = await Ubicacion.find();
  const umbralMetros = 150; // Subí de ~100m a 150m para más tolerancia GPS

  return ubicaciones.find((u) => {
    const distancia = calcularDistancia(u.lat, u.lng, lat, lng);
    return distancia <= umbralMetros;
  });
};

exports.fichar = async (req, res) => {
  try {
    const { usuarioId, tipo, lat, lng } = req.body;

    const ubicacion = await obtenerUbicacionValida(lat, lng);

    if (!ubicacion) {
      return res
        .status(400)
        .json({ success: false, message: "Ubicación inválida" });
    }

    const ubicacionConNombre = {
      nombre: ubicacion.nombre,
      lat: ubicacion.lat,
      lng: ubicacion.lng,
    };

    const ultimoFichaje = await Fichaje.findOne({ usuarioId }).sort({
      createdAt: -1,
    });

    if (tipo === "checkin") {
      if (ultimoFichaje && ultimoFichaje.tipo === "checkin") {
        return res.status(400).json({
          success: false,
          message: "Ya existe un Check In sin Check Out",
        });
      }

      await Fichaje.create({ usuarioId, tipo, ubicacion: ubicacionConNombre });

      await Jornada.create({
        usuarioId,
        fecha: new Date(),
        horasTrabajadas: 0,
        ubicacion: ubicacionConNombre,
      });

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
        lat,
        lng
      );

      const umbralCheck = 100; // Subí de 50m a 100m para tolerancia indoor
      if (distanciaCheck > umbralCheck) {
        return res.status(400).json({
          success: false,
          message: "Check Out en ubicación distinta al Check In",
        });
      }

      const horas =
        (Date.now() - new Date(ultimoFichaje.createdAt)) / 1000 / 60 / 60;

      await Fichaje.create({
        usuarioId,
        tipo,
        ubicacion: ubicacionConNombre,
        horasTrabajadas: horas,
      });

      const jornadaAbierta = await Jornada.findOne({
        usuarioId,
        checkOut: null,
      });

      if (jornadaAbierta) {
        jornadaAbierta.checkOut = new Date();
        jornadaAbierta.horasTrabajadas = horas;
        await jornadaAbierta.save();
      } else {
        await Jornada.create({
          usuarioId,
          fecha: new Date(ultimoFichaje.createdAt),
          checkOut: new Date(),
          horasTrabajadas: horas,
          ubicacion: ubicacionConNombre,
        });
      }

      return res.json({
        success: true,
        message: "Check Out registrado y jornada guardada",
        horas,
      });
    }

    res.status(400).json({ success: false, message: "Tipo inválido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// Jornadas
exports.listarJornadas = async (req, res) => {
  try {
    const nombre = req.query.nombre || "";
    let usuariosFiltrados = [];

    if (nombre) {
      usuariosFiltrados = await Usuario.find({
        $or: [
          { nombre: { $regex: nombre, $options: "i" } },
          { nombreCompleto: { $regex: nombre, $options: "i" } },
        ],
      }).lean();
    } else {
      usuariosFiltrados = await Usuario.find().lean();
    }

    const emailsUsuarios = usuariosFiltrados.map((u) => u.email);

    const filtro = nombre ? { usuarioId: { $in: emailsUsuarios } } : {};

    const jornadas = await Jornada.find(filtro).sort({ fecha: -1 }).lean();

    const mapaEmails = {};
    usuariosFiltrados.forEach((u) => {
      mapaEmails[u.email] = u.nombreCompleto || u.nombre || u.email;
    });

    const jornadasConNombre = jornadas.map((j) => ({
      ...j,
      nombreEmpleado: mapaEmails[j.usuarioId] || j.usuarioId,
    }));

    res.json(jornadasConNombre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener jornadas" });
  }
};

exports.listarFichajes = async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const filtro = usuarioId ? { usuarioId } : {};
    const fichajes = await Fichaje.find(filtro).sort({ createdAt: -1 });
    res.json(fichajes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener fichajes" });
  }
};
