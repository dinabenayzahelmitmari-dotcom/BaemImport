
const express = require("express");
const router = express.Router();
const Task = require("../models/Tarea");
const { authMiddleware } = require("../middleware/auth");
const {
  isAdmin,
  isSeller,
  getAccessibleClientIds,
  toObjectId,
} = require("../utils/accessScope");

async function buildTaskScope(user) {
  if (isAdmin(user)) return {};

  if (isSeller(user)) {
    const ids = await getAccessibleClientIds(user);
    const clientIds = ids.map((id) => toObjectId(id)).filter(Boolean);
    return {
      $or: [
        { asignadoA: user._id },
        { creadoPor: user._id },
        { cliente: { $in: clientIds } },
      ],
    };
  }

  const ids = await getAccessibleClientIds(user);
  const clientIds = ids.map((id) => toObjectId(id)).filter(Boolean);
  return { cliente: { $in: clientIds } };
}

function mergeFilters(base, scope) {
  if (!scope || Object.keys(scope).length === 0) return base;
  if (!base || Object.keys(base).length === 0) return scope;
  return { $and: [base, scope] };
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, prioridad, asignadoA } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (prioridad) filtro.prioridad = prioridad;
    if (asignadoA && isAdmin(req.user)) filtro.asignadoA = asignadoA;
    const scope = await buildTaskScope(req.user);
    const tasks = await Task.find(mergeFilters(filtro, scope))
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
    const scope = await buildTaskScope(req.user);
    const task = await Task.findOne(mergeFilters({ _id: req.params.id }, scope))
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
    const payload = { ...req.body, creadoPor: req.user._id };
    if (isSeller(req.user) && !payload.asignadoA) payload.asignadoA = req.user._id;
    const task = await Task.create(payload);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const scope = await buildTaskScope(req.user);
    if (req.body.estado === "completada") {
      req.body.completadaEn = new Date();
    }
    const task = await Task.findOneAndUpdate(mergeFilters({ _id: req.params.id }, scope), req.body, { new: true });
    if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const scope = await buildTaskScope(req.user);
    const deleted = await Task.findOneAndDelete(mergeFilters({ _id: req.params.id }, scope));
    if (!deleted) return res.status(404).json({ error: "Tarea no encontrada" });
    res.json({ mensaje: "Tarea eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
