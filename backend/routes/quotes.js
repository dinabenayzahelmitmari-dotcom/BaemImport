
const express = require("express");
const router = express.Router();
const Quote = require("../models/Presupuesto");
const { authMiddleware } = require("../middleware/auth");
const emailService = require("../services/email");
const pdfService = require("../services/pdf");

// Listar presupuestos
// Endpoint: GET /
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, cliente } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (cliente) filtro.cliente = cliente;
    const quotes = await Quote.find(filtro)
      .populate("cliente", "nombre apellidos email telefono")
      .populate("vehiculo", "marca modelo anio precio")
      .populate("creadoPor", "nombre")
      .sort({ createdAt: -1 });
    res.json(quotes);
  } catch {
    res.status(500).json({ error: "Error al obtener presupuestos" });
  }
});

// Obtener presupuesto por ID
// Endpoint: GET /:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo")
      .populate("creadoPor", "nombre");
    if (!quote) return res.status(404).json({ error: "Presupuesto no encontrado" });
    res.json(quote);
  } catch {
    res.status(500).json({ error: "Error al obtener presupuesto" });
  }
});

// Crear presupuesto
// Endpoint: POST /
router.post("/", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.create({ ...req.body, creadoPor: req.user._id });
    res.status(201).json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar presupuesto
// Endpoint: PUT /:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar presupuesto
// Endpoint: DELETE /:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Presupuesto eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// Descargar presupuesto como PDF
// Endpoint: GET /:id/pdf
router.get("/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo");
    if (!quote) return res.status(404).json({ error: "Presupuesto no encontrado" });

    const vehiculoDesc = quote.vehiculo
      ? `${quote.vehiculo.marca} ${quote.vehiculo.modelo} ${quote.vehiculo.anio}`
      : quote.descripcionVehiculo || "Vehiculo a determinar";

    const pdfBuffer = await pdfService.generarPresupuesto(quote, quote.cliente, vehiculoDesc);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${quote.numero}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: "Error al generar PDF: " + err.message });
  }
});

// Enviar presupuesto por email
// Endpoint: POST /:id/enviar
router.post("/:id/enviar", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo");
    if (!quote) return res.status(404).json({ error: "Presupuesto no encontrado" });
    if (!quote.cliente?.email) return res.status(400).json({ error: "El cliente no tiene email registrado" });

    const vehiculoDesc = quote.vehiculo
      ? `${quote.vehiculo.marca} ${quote.vehiculo.modelo} ${quote.vehiculo.anio}`
      : quote.descripcionVehiculo || "Vehiculo a determinar";

    await emailService.presupuestoCliente(quote, quote.cliente, vehiculoDesc);
    await Quote.findByIdAndUpdate(req.params.id, { estado: "enviado" });

    res.json({ mensaje: "Presupuesto enviado correctamente por email" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar email: " + err.message });
  }
});

module.exports = router;
