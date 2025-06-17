const mongoose = require('mongoose');

const jornadaSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  fecha: { type: Date, required: true },
  horasTrabajadas: { type: Number, required: true },
  ubicacion: {
    lat: Number,
    lng: Number
  },
  observaciones: String
});


module.exports = mongoose.model('Jornada', jornadaSchema)
