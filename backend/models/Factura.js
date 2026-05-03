const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true },
    pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    conceptos: [
      {
        descripcion: { type: String, required: true },
        cantidad: { type: Number, default: 1 },
        precioUnitario: { type: Number, required: true },
        iva: { type: Number, default: 21 },
      },
    ],
    subtotal: { type: Number, required: true },
    totalIva: { type: Number, required: true },
    total: { type: Number, required: true },
    estado: {
      type: String,
      enum: ["emitida", "pagada", "parcialmente_pagada", "vencida", "cancelada"],
      default: "emitida",
    },
    fechaVencimiento: { type: Date },
    metodoPago: {
      type: String,
      enum: ["Transferencia bancaria", "Efectivo", "Tarjeta", "Financiación", "Otro"],
      default: "Transferencia bancaria",
    },
    notas: { type: String },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "facturas" }
);

invoiceSchema.pre("save", async function (next) {
  if (!this.numero) {
    const count = await mongoose.model("Invoice").countDocuments();
    this.numero = `FAC-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Invoice", invoiceSchema);
