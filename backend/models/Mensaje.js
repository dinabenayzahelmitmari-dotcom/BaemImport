const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    remitente: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    destinatario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    texto: { type: String, required: true },
    leido: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "mensajes" }
);

module.exports = mongoose.model("Message", messageSchema);
