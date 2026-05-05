const mongoose = require("mongoose");
const User = require("./Usuario");
const { sendEmail } = require("../services/emailService");

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
  { timestamps: true }
);

// Enviar email automaticamente para notificaciones nuevas.
notificationSchema.pre("save", function (next) {
  this._wasNew = this.isNew;
  next();
});

notificationSchema.post("save", async function (doc) {
  try {
    if (!doc?._wasNew) return;
    const destinatario = await User.findById(doc.destinatario).select("email nombre").lean();
    if (!destinatario?.email) return;

    await sendEmail(
      destinatario.email,
      `Notificacion - ${doc.titulo}`,
      doc.mensaje,
      `<p>Hola ${destinatario.nombre || ""},</p><p>${doc.mensaje}</p>`
    );
  } catch (e) {
    console.error("Error email notificacion:", e.message);
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
