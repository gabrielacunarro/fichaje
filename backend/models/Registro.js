const mongoose = require('mongoose');

const registroSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  fecha: { type: Date, required: true },
  horasTrabajadas: { type: Number, required: true },
  ubicacion: {
    lat: Number,
    lng: Number
  },
  observaciones: String
});

// Usamos la base de datos "prod"
const prodDB = mongoose.connection.useDb('prod');

const Registro = prodDB.model('Registro', registroSchema, 'registros');

module.exports = Registro;
