const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
  nombre: String,
  lat: Number,
  lng: Number
});

module.exports = mongoose.model('Ubicacion', ubicacionSchema);
