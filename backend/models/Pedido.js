const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
    precioFinal: { type: Number, required: true },
    senial: { type: Number, default: 0 },
    restante: { type: Number, default: 0 },
    estado: {
      type: String,
      enum: ["presupuesto", "confirmado", "en_gestion", "completado", "cancelado"],
      default: "confirmado",
    },
    metodoPago: {
      type: String,
      enum: ["Transferencia bancaria", "Efectivo", "Tarjeta", "Financiacion", "Otro"],
      default: "Transferencia bancaria",
    },
    fase: {
      type: String,
      enum: ["alemania", "españa"],
      default: "alemania",
    },
    fechaEntregaEstimada: { type: Date },
    notas: { type: String },
    pasosImportacion: {
      vehiculo_localizado: { type: Boolean, default: false },
      pago_realizado: { type: Boolean, default: false },
      documentacion_alemania: { type: Boolean, default: false },
      en_transporte: { type: Boolean, default: false },
      homologacion: { type: Boolean, default: false },
      itv_pasada: { type: Boolean, default: false },
      matriculacion: { type: Boolean, default: false },
      transporte_domicilio: { type: Boolean, default: false },
      entregado: { type: Boolean, default: false },
    },
    documentos: {
      alemania: [
        { nombre: { type: String }, url: { type: String }, fecha: { type: Date, default: Date.now } }
      ],
      espania: [
        { nombre: { type: String }, url: { type: String }, fecha: { type: Date, default: Date.now } }
      ]
    },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: "pedidos" }
);

module.exports = mongoose.model("Order", orderSchema);
