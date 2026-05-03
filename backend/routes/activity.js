const express = require("express");
const router = express.Router();
const Activity = require("../models/Actividad");
const { authMiddleware } = require("../middleware/auth");

// Últimas actividades globales
router.get("/", authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = await Activity.find()
      .populate("usuario", "nombre")
      .populate("pedido", "precioFinal estado")
      .populate("vehiculo", "marca modelo")
      .populate("cliente", "nombre apellidos")
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(activities);
  } catch {
    res.status(500).json({ error: "Error al obtener actividad" });
  }
});

// Actividades de un pedido
router.get("/order/:orderId", authMiddleware, async (req, res) => {
  try {
    const activities = await Activity.find({ pedido: req.params.orderId })
      .populate("usuario", "nombre")
      .sort({ createdAt: -1 });
    res.json(activities);
  } catch {
    res.status(500).json({ error: "Error al obtener actividad del pedido" });
  }
});

// Crear actividad
router.post("/", authMiddleware, async (req, res) => {
  try {
    const act = await Activity.create({ ...req.body, usuario: req.user._id });
    res.status(201).json(act);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
