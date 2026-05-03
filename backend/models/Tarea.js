const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String },
    estado: {
      type: String,
      enum: ["pendiente", "en_progreso", "completada", "cancelada"],
      default: "pendiente",
    },
    prioridad: {
      type: String,
      enum: ["baja", "normal", "alta", "urgente"],
      default: "normal",
    },
    categoria: {
      type: String,
      enum: ["Importacion", "Documentacion", "Cliente", "Vehiculo", "Financiero", "Otro"],
      default: "Otro",
    },
    asignadoA: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pedido: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    vehiculo: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    fechaLimite: { type: Date },
    completadaEn: { type: Date },
  },
  { timestamps: true, collection: "tareas" }
);

module.exports = mongoose.model("Task", taskSchema);
