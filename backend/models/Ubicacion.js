const mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
  nombre: String,
  lat: Number,
  lng: Number
}, {
  collection: 'ubicaciones'  // aclarar colección.
});

module.exports = mongoose.model('Ubicacion', ubicacionSchema);
