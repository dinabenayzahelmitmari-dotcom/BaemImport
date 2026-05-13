
const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nombre: { type: String, required: true, trim: true },
    apellidos: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    telefono: { type: String, trim: true },
    dni: { type: String, trim: true },
    direccion: { type: String },
    ciudad: { type: String },
    pais: { type: String, default: "Espana" },
    notas: { type: String },
    origen: { type: String, enum: ["web", "referido", "llamada", "otro"], default: "otro" },
  },
  { timestamps: true }
);

// Evitar duplicados por email/dni cuando existan (y permitir docs sin email/dni).
clientSchema.index({ email: 1 }, { unique: true, sparse: true });
clientSchema.index({ dni: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Client", clientSchema);
