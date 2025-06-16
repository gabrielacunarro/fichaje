const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Usamos la base de datos "prod"
const prodDB = mongoose.connection.useDb('prod');

const Usuario = prodDB.model('Usuario', usuarioSchema, 'usuarios');

module.exports = Usuario;
