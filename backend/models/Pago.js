
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    monto: { type: Number, required: true },
    metodo: {
      type: String,
      enum: ["Transferencia bancaria", "Efectivo", "Tarjeta", "Financiacion"],
      default: "Transferencia bancaria",
    },
    concepto: { type: String, default: "Pago parcial" },
    fecha: { type: Date, default: Date.now },
    comprobanteUrl: { type: String }, // URL opcional al comprobante subido
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
