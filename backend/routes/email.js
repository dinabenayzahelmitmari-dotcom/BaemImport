const express = require("express");
const router = express.Router();
const Client = require("../models/Cliente");
const Order = require("../models/Pedido");
const { authMiddleware } = require("../middleware/auth");
const emailService = require("../services/email");
const { sendEmail } = require("../services/email");

// Enviar email manual personalizado
router.post("/manual", authMiddleware, async (req, res) => {
  try {
    const { para, asunto, mensaje } = req.body;
    if (!para || !asunto || !mensaje) return res.status(400).json({ error: "Datos incompletos (para, asunto, mensaje)" });
    
    await sendEmail(para, asunto, mensaje, `<div>${mensaje.replace(/\n/g, '<br>')}</div>`);
    res.json({ mensaje: "Email enviado con éxito" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar: " + err.message });
  }
});

// Enviar email de bienvenida a cliente
router.post("/bienvenida/:clienteId", authMiddleware, async (req, res) => {
  try {
    const cliente = await Client.findById(req.params.clienteId);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    if (!cliente.email) return res.status(400).json({ error: "El cliente no tiene email registrado" });
    await emailService.bienvenidaCliente(cliente);
    res.json({ mensaje: "Email de bienvenida enviado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar email: " + err.message });
  }
});

// Notificar vehiculo listo al cliente de un pedido
router.post("/vehiculo-listo/:pedidoId", authMiddleware, async (req, res) => {
  try {
    const pedido = await Order.findById(req.params.pedidoId).populate("cliente").populate("vehiculo");
    if (!pedido) return res.status(404).json({ error: "Pedido no encontrado" });
    if (!pedido.cliente?.email) return res.status(400).json({ error: "El cliente no tiene email registrado" });
    await emailService.vehiculoListo(pedido.cliente, pedido.vehiculo);
    res.json({ mensaje: "Notificacion enviada al cliente" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar email: " + err.message });
  }
});

// Enviar email personalizado a cliente
router.post("/seguimiento/:clienteId", authMiddleware, async (req, res) => {
  try {
    const { asunto, mensaje } = req.body;
    if (!asunto || !mensaje) return res.status(400).json({ error: "Se requiere asunto y mensaje" });
    const cliente = await Client.findById(req.params.clienteId);
    if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
    if (!cliente.email) return res.status(400).json({ error: "El cliente no tiene email registrado" });
    await emailService.emailSeguimiento(cliente, asunto, mensaje);
    res.json({ mensaje: "Email enviado correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar email: " + err.message });
  }
});

// Enviar notificacion interna al equipo
router.post("/interno", authMiddleware, async (req, res) => {
  try {
    const { asunto, cuerpo, destinatarios } = req.body;
    if (!asunto || !cuerpo || !destinatarios) return res.status(400).json({ error: "Datos incompletos" });
    await emailService.notificacionInterna(asunto, cuerpo, destinatarios);
    res.json({ mensaje: "Notificacion interna enviada" });
  } catch (err) {
    res.status(500).json({ error: "Error al enviar email: " + err.message });
  }
});

module.exports = router;
