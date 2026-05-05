const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    anio: { type: Number, required: true },
    combustible: { type: String, enum: ["Diesel", "Gasolina", "Hibrido", "Electrico", "GLP", "Otro"], default: "Diesel" },
    transmision: { type: String, enum: ["Automatico", "Manual"], default: "Automatico" },
    kilometros: { type: Number, default: 0 },
    color: { type: String },
    vin: { type: String },
    precio: { type: Number, required: true },
    precioCompra: { type: Number },
    margen: { type: Number },
    ubicacion: { type: String, enum: ["Alemania", "En transito", "Espana", "Pendiente de homologar", "Otro"], default: "Alemania" },
    estado: { type: String, enum: ["disponible", "reservado", "en_transito", "vendido"], default: "disponible" },
    descripcion: { type: String },
    extras: [{ type: String }],
    fotos: [{ type: String }],
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

vehicleSchema.index({ vin: 1 }, { unique: true, sparse: true });

vehicleSchema.pre("save", function (next) {
  if (this.precio && this.precioCompra) {
    this.margen = this.precio - this.precioCompra;
  }
  next();
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
