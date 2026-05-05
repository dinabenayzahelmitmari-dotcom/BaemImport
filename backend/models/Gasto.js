const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    concepto: { type: String, required: true },
    importe: { type: Number, required: true },
    descripcion: { type: String },
    fecha: { type: Date, default: Date.now },
    pagado: { type: Boolean, default: false },
    categoria: {
      type: String,
      enum: ["compra", "transporte", "tramitacion", "reparacion", "otros"],
      default: "otros",
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
