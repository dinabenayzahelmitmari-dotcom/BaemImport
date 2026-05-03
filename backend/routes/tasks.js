const express = require("express");
const router = express.Router();
const Task = require("../models/Tarea");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, prioridad, asignadoA } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (prioridad) filtro.prioridad = prioridad;
    if (asignadoA) filtro.asignadoA = asignadoA;
    const tasks = await Task.find(filtro)
      .populate("asignadoA", "nombre")
      .populate("creadoPor", "nombre")
      .populate("pedido", "estado precioFinal")
      .populate("vehiculo", "marca modelo anio")
      .populate("cliente", "nombre apellidos")
      .sort({ prioridad: -1, fechaLimite: 1, createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: "Error al obtener tareas" });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("asignadoA", "nombre email")
      .populate("creadoPor", "nombre")
      .populate("vehiculo", "marca modelo anio")
      .populate("cliente", "nombre apellidos telefono");
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(task);
  } catch {
    res.status(500).json({ error: "Error al obtener tarea" });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, creadoPor: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.body.estado === "completada") {
      req.body.completadaEn = new Date();
    }
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Tarea eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
