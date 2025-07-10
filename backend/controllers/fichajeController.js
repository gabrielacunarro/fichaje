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
  const umbralMetros = 150;

  for (const u of ubicaciones) {
    const distancia = calcularDistancia(u.lat, u.lng, lat, lng);
    if (distancia <= umbralMetros) {
      return u;
    }
  }
  return null;
};

exports.fichar = async (req, res) => {
  try {
    // Obtenemos usuarioId del token validado
    const usuarioId = req.user._id.toString();

    // El resto de datos vienen del body
    const { tipo, lat, lng } = req.body;

    // Validar que lat y lng sean números válidos
    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      return res
        .status(400)
        .json({ success: false, message: "Ubicación inválida" });
    }

    // Validación de ubicación válida
    const ubicacion = await obtenerUbicacionValida(latNum, lngNum);

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

    // Buscamos último fichaje para el usuario
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
        latNum,
        lngNum
      );

      const umbralCheck = 100;
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    // Buscar jornadas con populate de usuarioId, y filtrando por nombre si viene
    const filtroUsuario = nombre
      ? { 'usuarioId.nombre': { $regex: nombre, $options: "i" } }
      : {};

    const total = await Jornada.countDocuments(filtroUsuario);

    const jornadas = await Jornada.find()
      .populate({
        path: 'usuarioId',
        select: 'nombre',
        match: nombre ? { nombre: { $regex: nombre, $options: "i" } } : {},
      })
      .sort({ fecha: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Filtrar jornadas donde populate no encontró usuario (por el match)
    const jornadasFiltradas = jornadas.filter(j => j.usuarioId != null);

    res.json({
      jornadas: jornadasFiltradas,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener jornadas" });
  }
};


exports.listarFichajes = async (req, res) => {
  try {
    const usuarioId = req.query.usuarioId;
    const filtro = usuarioId ? { usuarioId } : {};

    // Usamos populate para traer el nombre del usuario en el fichaje
    const fichajes = await Fichaje.find(filtro)
      .populate('usuarioId', 'nombre email') // trae solo nombre y email
      .sort({ createdAt: -1 })
      .lean();

    // Opcional: mapear para que en el JSON salga un campo nombreUsuario por ejemplo
    const fichajesConNombre = fichajes.map(f => ({
      ...f,
      nombreUsuario: f.usuarioId?.nombre || 'Desconocido',
      emailUsuario: f.usuarioId?.email || ''
    }));

    res.json(fichajesConNombre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener fichajes" });
  }
};

