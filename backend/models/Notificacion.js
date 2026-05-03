const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    destinatario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    titulo: { type: String, required: true },
    mensaje: { type: String, required: true },
    tipo: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
    },
    leida: { type: Boolean, default: false },
    enlace: { type: String }, // URL interna opcional
    pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  },
  { timestamps: true, collection: "notificaciones" }
);

module.exports = mongoose.model("Notification", notificationSchema);
