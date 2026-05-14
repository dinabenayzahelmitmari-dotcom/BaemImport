
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehiculo");
const Expense = require("../models/Gasto");
const { authMiddleware } = require("../middleware/auth");
const pdfService = require("../services/pdf");
const { getAccessibleVehicleScope } = require("../utils/accessScope");

function mergeScopes(baseFilter, scopeFilter) {
  if (!scopeFilter || Object.keys(scopeFilter).length === 0) return baseFilter;
  if (!baseFilter || Object.keys(baseFilter).length === 0) return scopeFilter;
  return { $and: [baseFilter, scopeFilter] };
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, marca, combustible, ubicacion, search } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (marca) filtro.marca = new RegExp(marca, "i");
    if (combustible) filtro.combustible = combustible;
    if (ubicacion) filtro.ubicacion = ubicacion;
    if (search) {
      filtro.$or = [
        { marca: new RegExp(search, "i") },
        { modelo: new RegExp(search, "i") },
        { vin: new RegExp(search, "i") },
      ];
    }
    const scope = await getAccessibleVehicleScope(req.user);
    const vehicles = await Vehicle.find(mergeScopes(filtro, scope)).sort({ createdAt: -1 });
    // Garantiza coherencia de margen en respuesta (precio - precioCompra),
    // incluso si el documento fue actualizado via findOneAndUpdate en el pasado.
    const out = vehicles.map((v) => {
      const obj = v.toObject({ virtuals: false });
      const precio = Number(obj.precio);
      const compra = Number(obj.precioCompra);
      if (Number.isFinite(precio) && Number.isFinite(compra)) obj.margen = precio - compra;
      else obj.margen = undefined;
      return obj;
    });
    res.json(out);
  } catch { res.status(500).json({ error: "Error al obtener vehículos" }); }
});
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const scope = await getAccessibleVehicleScope(req.user);
    const vehicle = await Vehicle.findOne(mergeScopes({ _id: req.params.id }, scope));
    if (!vehicle) return res.status(404).json({ error: "Vehículo no encontrado" });
    const obj = vehicle.toObject({ virtuals: false });
    const precio = Number(obj.precio);
    const compra = Number(obj.precioCompra);
    if (Number.isFinite(precio) && Number.isFinite(compra)) obj.margen = precio - compra;
    else obj.margen = undefined;
    res.json(obj);
  } catch { res.status(500).json({ error: "Error al obtener vehículo" }); }
});
router.get("/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const scope = await getAccessibleVehicleScope(req.user);
    const vehicle = await Vehicle.findOne(mergeScopes({ _id: req.params.id }, scope));
    if (!vehicle) return res.status(404).json({ error: "Vehículo no encontrado" });
    const gastosData = await Expense.find({ vehiculo: req.params.id }).sort({ fecha: -1 });
    const pdfBuffer = await pdfService.generarFichaVehiculo(vehicle, gastosData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ficha-${vehicle.marca}-${vehicle.modelo}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) { res.status(500).json({ error: "Error al generar PDF: " + err.message }); }
});
router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = { ...req.body, creadoPor: req.user._id };
    const vehicle = await Vehicle.create(payload);
    res.status(201).json(vehicle);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const scope = await getAccessibleVehicleScope(req.user);
    const vehicle = await Vehicle.findOneAndUpdate(
      mergeScopes({ _id: req.params.id }, scope),
      req.body,
      { new: true, runValidators: true },
    );
    if (!vehicle) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(vehicle);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const scope = await getAccessibleVehicleScope(req.user);
    const deleted = await Vehicle.findOneAndDelete(mergeScopes({ _id: req.params.id }, scope));
    if (!deleted) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json({ mensaje: "Vehículo eliminado" });
  } catch { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;
