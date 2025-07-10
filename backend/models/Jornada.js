const mongoose = require("mongoose");

const jornadaSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    fecha: { type: Date, required: true },
    checkOut: Date,
    horasTrabajadas: { type: Number, required: true },
    ubicacion: {
      nombre: { type: String },
      lat: Number,
      lng: Number,
    },
    observaciones: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Jornada", jornadaSchema);
