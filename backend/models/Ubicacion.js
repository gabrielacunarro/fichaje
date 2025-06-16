const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
  nombre: String,
  lat: Number,
  lng: Number
});

// Usamos la base de datos "prod"
const prodDB = mongoose.connection.useDb('prod');

const Ubicacion = prodDB.model('Ubicacion', ubicacionSchema, 'ubicaciones');

module.exports = Ubicacion;
