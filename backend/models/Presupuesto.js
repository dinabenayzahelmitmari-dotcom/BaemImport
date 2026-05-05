const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    descripcionVehiculo: { type: String }, // Para vehículos no registrados aún
    precioBase: { type: Number, required: true },
    descuento: { type: Number, default: 0 },
    gastosTransporte: { type: Number, default: 0 },
    gastosGestion: { type: Number, default: 0 },
    gastosMatriculacion: { type: Number, default: 0 },
    otrosGastos: { type: Number, default: 0 },
    precioFinal: { type: Number, required: true },
    iva: { type: Number, default: 21 },
    estado: {
      type: String,
      enum: ["borrador", "enviado", "aceptado", "rechazado", "expirado"],
      default: "borrador",
    },
    validezDias: { type: Number, default: 15 },
    notas: { type: String },
    condiciones: { type: String, default: "Precios indicados sin IVA salvo que se indique lo contrario. Presupuesto sujeto a disponibilidad del vehículo." },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

quoteSchema.pre("save", async function (next) {
  if (!this.numero) {
    const count = await mongoose.model("Quote").countDocuments();
    this.numero = `PRE-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Quote", quoteSchema);
