
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      enum: ["pedido_creado", "estado_cambiado", "nota_añadida", "documento_añadido", "pago_registrado", "vehiculo_creado", "cliente_creado"],
      required: true,
    },
    descripcion: { type: String, required: true },
    pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
