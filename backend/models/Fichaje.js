const mongoose = require('mongoose');

const fichajeSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  tipo: { type: String, enum: ['checkin', 'checkout'], required: true },
  ubicacion: {
    nombre: { type: String },
    lat: Number,
    lng: Number
  },
  horasTrabajadas: Number,
}, { timestamps: true });


module.exports = mongoose.model('Fichaje', fichajeSchema);

