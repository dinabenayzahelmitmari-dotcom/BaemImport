
const express = require("express");
const router = express.Router();
const Expense = require("../models/Gasto");
const Vehicle = require("../models/Vehiculo");
const { authMiddleware } = require("../middleware/auth");
const { getAccessibleVehicleScope } = require("../utils/accessScope");

async function getAccessibleVehicleIds(user) {
  const scope = await getAccessibleVehicleScope(user);
  return Vehicle.distinct("_id", scope);
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { vehiculo, pagado } = req.query;
    const filtro = {};
    if (vehiculo) filtro.vehiculo = vehiculo;
    if (pagado !== undefined) filtro.pagado = pagado === "true";
    const vehicleIds = await getAccessibleVehicleIds(req.user);
    filtro.vehiculo = vehiculo
      ? { $in: vehicleIds.filter((id) => String(id) === String(vehiculo)) }
      : { $in: vehicleIds };
    const expenses = await Expense.find(filtro)
      .populate("vehiculo", "marca modelo anio")
      .sort({ fecha: -1 });
    res.json(expenses);
  } catch { res.status(500).json({ error: "Error al obtener gastos" }); }
});
router.get("/vehicle/:vehiculoId", authMiddleware, async (req, res) => {
  try {
    const vehicleIds = await getAccessibleVehicleIds(req.user);
    if (!vehicleIds.some((id) => String(id) === String(req.params.vehiculoId))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const gastos = await Expense.find({ vehiculo: req.params.vehiculoId }).sort({ fecha: -1 });
    const total = gastos.reduce((s, g) => s + g.importe, 0);
    res.json({ gastos, total });
  } catch { res.status(500).json({ error: "Error al obtener gastos" }); }
});
router.post("/", authMiddleware, async (req, res) => {
  try {
    const vehicleIds = await getAccessibleVehicleIds(req.user);
    if (req.body.vehiculo && !vehicleIds.some((id) => String(id) === String(req.body.vehiculo))) {
      return res.status(403).json({ error: "No puedes crear gastos para este vehículo" });
    }
    const expense = await Expense.create({ ...req.body, creadoPor: req.user._id });
    res.status(201).json(expense);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Expense.findById(req.params.id).select("vehiculo");
    if (!current) return res.status(404).json({ error: "Gasto no encontrado" });
    const vehicleIds = await getAccessibleVehicleIds(req.user);
    if (!vehicleIds.some((id) => String(id) === String(current.vehiculo))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    if (req.body.vehiculo && !vehicleIds.some((id) => String(id) === String(req.body.vehiculo))) {
      return res.status(403).json({ error: "No puedes reasignar el gasto a ese vehículo" });
    }
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expense);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Expense.findById(req.params.id).select("vehiculo");
    if (!current) return res.status(404).json({ error: "Gasto no encontrado" });
    const vehicleIds = await getAccessibleVehicleIds(req.user);
    if (!vehicleIds.some((id) => String(id) === String(current.vehiculo))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Gasto eliminado" });
  } catch { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;
