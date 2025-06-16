const mongoose = require('mongoose');

const fichajeSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  tipo: { type: String, enum: ['checkin', 'checkout'], required: true },
  ubicacion: {
    lat: Number,
    lng: Number
  },
  horasTrabajadas: Number,
}, { timestamps: true });

// Aquí usamos useDb para seleccionar la base "prod"
const prodDB = mongoose.connection.useDb('prod');

// Creamos el modelo en la base "prod", colección "fichajes"
const Fichaje = prodDB.model('Fichaje', fichajeSchema, 'fichajes');

module.exports = Fichaje;

