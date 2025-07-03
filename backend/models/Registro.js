const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  fecha: { type: Date, required: true },
  horasTrabajadas: { type: Number, required: true },
  ubicacion: {
    nombre: { type: String },
    lat: Number,
    lng: Number
  },
  observaciones: String
});

module.exports = mongoose.model('Registro', registroSchema)
