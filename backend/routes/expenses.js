const express = require("express");
const router = express.Router();
const Expense = require("../models/Gasto");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { vehiculo, pagado } = req.query;
    const filtro = {};
    if (vehiculo) filtro.vehiculo = vehiculo;
    if (pagado !== undefined) filtro.pagado = pagado === "true";
    const expenses = await Expense.find(filtro)
      .populate("vehiculo", "marca modelo anio")
      .sort({ fecha: -1 });
    res.json(expenses);
  } catch { res.status(500).json({ error: "Error al obtener gastos" }); }
});

router.get("/vehicle/:vehiculoId", authMiddleware, async (req, res) => {
  try {
    const gastos = await Expense.find({ vehiculo: req.params.vehiculoId }).sort({ fecha: -1 });
    const total = gastos.reduce((s, g) => s + g.importe, 0);
    res.json({ gastos, total });
  } catch { res.status(500).json({ error: "Error al obtener gastos" }); }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.create({ ...req.body, creadoPor: req.user._id });
    res.status(201).json(expense);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Gasto eliminado" });
  } catch { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;
