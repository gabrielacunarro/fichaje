const Fichaje = require('../models/Fichaje');
const Ubicacion = require('../models/Ubicacion');

// Verifica si la ubicación está dentro de las ubicaciones permitidas
const esUbicacionValida = async (lat, lng) => {
  const ubicaciones = await Ubicacion.find();
  const umbral = 0.0005; // ~50m en coordenadas GPS

  return ubicaciones.some(u => (
    Math.abs(u.lat - lat) < umbral && Math.abs(u.lng - lng) < umbral
  ));
};

// Calcula la distancia en metros entre dos coordenadas GPS
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => x * Math.PI / 180;
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distancia en metros
};

exports.fichar = async (req, res) => {
  try {
    const { usuarioId, tipo, lat, lng } = req.body;

    if (!await esUbicacionValida(lat, lng)) {
      return res.status(400).json({ success: false, message: 'Ubicación inválida' });
    }

    // Último fichaje del usuario (para saber si es checkin previo)
    const ultimoFichaje = await Fichaje.findOne({ usuarioId }).sort({ createdAt: -1 });

    if (tipo === 'checkin') {
      if (ultimoFichaje && ultimoFichaje.tipo === 'checkin') {
        return res.status(400).json({ success: false, message: 'Ya existe un Check In sin Check Out' });
      }
      await Fichaje.create({ usuarioId, tipo, ubicacion: { lat, lng } });
      return res.json({ success: true, message: 'Check In registrado' });
    }

    if (tipo === 'checkout') {
      if (!ultimoFichaje || ultimoFichaje.tipo !== 'checkin') {
        return res.status(400).json({ success: false, message: 'No se encontró Check In previo' });
      }

      // 🔍 Comparar ubicación del último checkin vs ubicación actual (checkout)
      const distanciaCheck = calcularDistancia(
        ultimoFichaje.ubicacion.lat, ultimoFichaje.ubicacion.lng,
        lat, lng
      );

      const umbralCheck = 50; // 50 metros de tolerancia
      if (distanciaCheck > umbralCheck) {
        return res.status(400).json({ success: false, message: 'Check Out en ubicación distinta al Check In' });
      }

      // Calcular horas trabajadas
      const horas = (Date.now() - new Date(ultimoFichaje.createdAt)) / 1000 / 60 / 60;

      await Fichaje.create({
        usuarioId,
        tipo,
        ubicacion: { lat, lng },
        horasTrabajadas: horas
      });

      return res.json({ success: true, message: 'Check Out registrado', horas });
    }

    res.status(400).json({ success: false, message: 'Tipo inválido' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
};
