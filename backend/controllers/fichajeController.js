const Fichaje = require('../models/Fichaje');
const Ubicacion = require('../models/Ubicacion');

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

    if (!await esUbicacionValida(lat, lng)) {
      return res.status(400).json({ success: false, message: 'Ubicación inválida' });
    }

    // Buscamos el último fichaje del usuario ordenado por fecha
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
