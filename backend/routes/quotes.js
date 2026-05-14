
const express = require("express");
const router = express.Router();
const Quote = require("../models/Presupuesto");
const { authMiddleware } = require("../middleware/auth");
const emailService = require("../services/email");
const pdfService = require("../services/pdf");
const {
  isAdmin,
  applyClientScopeToFilter,
  canAccessClient,
} = require("../utils/accessScope");

// Listar presupuestos
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, cliente } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (isAdmin(req.user) && cliente) {
      filtro.cliente = cliente;
    } else {
      await applyClientScopeToFilter(req.user, filtro, "cliente");
    }
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
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo")
      .populate("creadoPor", "nombre");
    if (!quote) return res.status(404).json({ error: "Presupuesto no encontrado" });
    if (!(await canAccessClient(req.user, quote.cliente?._id))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    res.json(quote);
  } catch {
    res.status(500).json({ error: "Error al obtener presupuesto" });
  }
});

// Crear presupuesto
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (!(await canAccessClient(req.user, req.body.cliente))) {
      return res.status(403).json({ error: "No puedes crear presupuestos para este cliente" });
    }
    const quote = await Quote.create({ ...req.body, creadoPor: req.user._id });
    res.status(201).json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar presupuesto
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Quote.findById(req.params.id).select("cliente");
    if (!current) return res.status(404).json({ error: "Presupuesto no encontrado" });
    if (!(await canAccessClient(req.user, current.cliente))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    if (req.body.cliente && !(await canAccessClient(req.user, req.body.cliente))) {
      return res.status(403).json({ error: "No puedes reasignar a ese cliente" });
    }
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar presupuesto
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Quote.findById(req.params.id).select("cliente");
    if (!current) return res.status(404).json({ error: "Presupuesto no encontrado" });
    if (!(await canAccessClient(req.user, current.cliente))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Presupuesto eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// Descargar presupuesto como PDF
router.get("/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo");
    if (!quote) return res.status(404).json({ error: "Presupuesto no encontrado" });
    if (!(await canAccessClient(req.user, quote.cliente?._id))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

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
router.post("/:id/enviar", authMiddleware, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo");
    if (!quote) return res.status(404).json({ error: "Presupuesto no encontrado" });
    if (!(await canAccessClient(req.user, quote.cliente?._id))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
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
