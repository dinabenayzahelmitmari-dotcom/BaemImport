const express = require("express");
const router = express.Router();
const Notification = require("../models/Notificacion");
const { authMiddleware } = require("../middleware/auth");

// Obtener notificaciones del usuario actual
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ destinatario: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const noLeidas = await Notification.countDocuments({ destinatario: req.user._id, leida: false });
    res.json({ notifications, noLeidas });
  } catch {
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
});

// Marcar como leida
router.put("/:id/leer", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { leida: true });
    res.json({ mensaje: "Notificacion marcada como leida" });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// Marcar todas como leidas
router.put("/leer-todas", authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ destinatario: req.user._id, leida: false }, { leida: true });
    res.json({ mensaje: "Todas las notificaciones marcadas como leidas" });
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// Crear notificacion (uso interno del sistema)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.create(req.body);
    // El envio por email se gestiona en el hook del modelo Notificacion.
    res.status(201).json(notif);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar notificacion
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Notificacion eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
