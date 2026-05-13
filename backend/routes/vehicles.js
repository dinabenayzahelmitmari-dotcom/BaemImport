
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehiculo");
const Expense = require("../models/Gasto");
const { authMiddleware } = require("../middleware/auth");
const pdfService = require("../services/pdf");

// Endpoint: GET /
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
    const vehicles = await Vehicle.find(filtro).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch { res.status(500).json({ error: "Error al obtener vehículos" }); }
});

// Endpoint: GET /:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(vehicle);
  } catch { res.status(500).json({ error: "Error al obtener vehículo" }); }
});

// Endpoint: GET /:id/pdf
router.get("/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: "Vehículo no encontrado" });
    const gastosData = await Expense.find({ vehiculo: req.params.id }).sort({ fecha: -1 });
    const pdfBuffer = await pdfService.generarFichaVehiculo(vehicle, gastosData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ficha-${vehicle.marca}-${vehicle.modelo}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) { res.status(500).json({ error: "Error al generar PDF: " + err.message }); }
});

// Endpoint: POST /
router.post("/", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(vehicle);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Endpoint: PUT /:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ error: "Vehículo no encontrado" });
    res.json(vehicle);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Endpoint: DELETE /:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Vehículo eliminado" });
  } catch { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;
