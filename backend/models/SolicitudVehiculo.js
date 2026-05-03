const mongoose = require("mongoose");

const vehicleRequestSchema = new mongoose.Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    anioDesde: { type: Number },
    presupuesto: { type: Number },
    combustible: { type: String },
    transmision: { type: String },
    extras: { type: String },
    estado: { type: String, enum: ["pendiente", "en_revisión", "contactado", "finalizado"], default: "pendiente" },
  },
  { timestamps: true, collection: "solicitudes_vehiculos" }
);

module.exports = mongoose.model("VehicleRequest", vehicleRequestSchema);
