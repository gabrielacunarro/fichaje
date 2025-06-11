const Fichaje = require('../models/Fichaje');
const Ubicacion = require('../models/Ubicacion');
const { checkIPLocation, calcularDistancia } = require('../utils/geoip');

const esUbicacionValida = async (lat, lng) => {
  const ubicaciones = await Ubicacion.find();
  const umbral = 0.0005; // ~50m

  return ubicaciones.some(u => (
    Math.abs(u.lat - lat) < umbral && Math.abs(u.lng - lng) < umbral
  ));
};

exports.fichar = async (req, res) => {
  try {
    const { usuarioId, tipo, lat, lng } = req.body;

    // 1. Verificación de ubicación GPS contra zonas permitidas
    if (!await esUbicacionValida(lat, lng)) {
      return res.status(400).json({ success: false, message: 'Ubicación GPS inválida' });
    }

    // 2. Obtener IP real
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // 3. Consultar ubicación IP
    const geoIpData = await checkIPLocation(ip);
    if (!geoIpData) {
      return res.status(500).json({ success: false, message: 'Error al obtener ubicación IP' });
    }

    // 4. Calcular distancia entre IP y GPS
    const distancia = calcularDistancia(
      geoIpData.latitude, geoIpData.longitude,
      lat, lng
    );

    // 5. Validar distancia (ejemplo: máx 200km)
    if (distancia > 200000) { // 200km
      return res.status(400).json({ success: false, message: 'Discrepancia IP/GPS detectada, posible GPS fake' });
    }

    // 6. Lógica de fichaje normal
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
