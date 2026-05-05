const express = require("express");
const router = express.Router();
const Invoice = require("../models/Factura");
const Client = require("../models/Cliente");
const { authMiddleware } = require("../middleware/auth");
const emailService = require("../services/email");
const pdfService = require("../services/pdf");

// Listar facturas
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, cliente } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (cliente) filtro.cliente = cliente;
    const invoices = await Invoice.find(filtro)
      .populate("cliente", "nombre apellidos email telefono")
      .populate("vehiculo", "marca modelo anio")
      .populate("pedido", "precioFinal estado")
      .populate("creadoPor", "nombre")
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch {
    res.status(500).json({ error: "Error al obtener facturas" });
  }
});

// Obtener factura por ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo")
      .populate("pedido")
      .populate("creadoPor", "nombre");
    if (!invoice) return res.status(404).json({ error: "Factura no encontrada" });
    res.json(invoice);
  } catch {
    res.status(500).json({ error: "Error al obtener factura" });
  }
});

// Crear factura
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Calcular totales automáticamente
    const conceptos = req.body.conceptos || [];
    let subtotal = 0;
    let totalIva = 0;
    conceptos.forEach((c) => {
      const base = c.cantidad * c.precioUnitario;
      subtotal += base;
      totalIva += base * (c.iva / 100);
    });
    const total = subtotal + totalIva;

    const invoice = await Invoice.create({
      ...req.body,
      subtotal: Math.round(subtotal * 100) / 100,
      totalIva: Math.round(totalIva * 100) / 100,
      total: Math.round(total * 100) / 100,
      creadoPor: req.user._id,
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar factura
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.body.conceptos) {
      const conceptos = req.body.conceptos;
      let subtotal = 0, totalIva = 0;
      conceptos.forEach((c) => {
        const base = c.cantidad * c.precioUnitario;
        subtotal += base;
        totalIva += base * (c.iva / 100);
      });
      req.body.subtotal = Math.round(subtotal * 100) / 100;
      req.body.totalIva = Math.round(totalIva * 100) / 100;
      req.body.total = Math.round((subtotal + totalIva) * 100) / 100;
    }
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar factura
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Factura eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

// Descargar factura como PDF
router.get("/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("cliente");
    if (!invoice) return res.status(404).json({ error: "Factura no encontrada" });

    const pdfBuffer = await pdfService.generarFactura(invoice, invoice.cliente);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.numero}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: "Error al generar PDF: " + err.message });
  }
});

// Enviar factura por email
router.post("/:id/enviar", authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("cliente");
    if (!invoice) return res.status(404).json({ error: "Factura no encontrada" });
    if (!invoice.cliente?.email) return res.status(400).json({ error: "El cliente no tiene email registrado" });

    await emailService.facturaEmitida(invoice, invoice.cliente);
    res.json({ mensaje: "Factura enviada correctamente por email" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar email: " + err.message });
  }
});

module.exports = router;
