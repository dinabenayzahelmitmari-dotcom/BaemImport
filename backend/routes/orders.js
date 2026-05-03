const express = require("express");
const router = express.Router();
const Order = require("../models/Pedido");
const Notification = require("../models/Notificacion");
const { authMiddleware } = require("../middleware/auth");
const emailService = require("../services/email");
const { sendEmail } = require("../services/emailService");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, cliente } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;
    if (cliente) filtro.cliente = cliente;
    const orders = await Order.find(filtro)
      .populate("cliente", "nombre apellidos email telefono")
      .populate("vehiculo", "marca modelo anio combustible transmision precio color")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch { res.status(500).json({ error: "Error al obtener pedidos" }); }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo")
      .populate("creadoPor", "nombre");
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(order);
  } catch { res.status(500).json({ error: "Error al obtener pedido" }); }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const data = { ...req.body, creadoPor: req.user._id };
    data.restante = (parseFloat(data.precioFinal) || 0) - (parseFloat(data.senial) || 0);
    const order = await Order.create(data);
    const populated = await Order.findById(order._id).populate("cliente").populate("vehiculo");
    
    // Automatización: Registrar el pago inicial si existe señal
    if (parseFloat(data.senial) > 0) {
      const Payment = require("../models/Pago");
      await Payment.create({
        pedido: order._id,
        cliente: data.cliente,
        monto: data.senial,
        metodo: data.metodoPago || "Transferencia bancaria",
        concepto: "Pago inicial / Señal"
      }).catch(console.error);
    }

    // Automatización: Crear tareas estándar para el nuevo pedido
    const Task = require("../models/Tarea");
    const tareasEstardar = [
      { titulo: "Verificar documentación origen (Alemania)", categoria: "Documentacion", prioridad: "alta" },
      { titulo: "Gestionar transporte internacional", categoria: "Importacion", prioridad: "normal" },
      { titulo: "Revisar pago de señal", categoria: "Financiero", prioridad: "urgente" }
    ];
    for (const t of tareasEstardar) {
      await Task.create({
        ...t,
        pedido: order._id,
        asignadoA: req.user._id,
        creadoPor: req.user._id,
        fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días límite
      }).catch(console.error);
    }

    // Send confirmation email
    try { await emailService.confirmacionPedido(populated, populated.cliente, populated.vehiculo); } catch {}
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Order.findById(req.params.id).populate("cliente");
    
    if (req.body.precioFinal !== undefined || req.body.senial !== undefined) {
      const precio = parseFloat(req.body.precioFinal ?? current.precioFinal) || 0;
      const senial = parseFloat(req.body.senial ?? current.senial) || 0;
      req.body.restante = precio - senial;
    }

    // Automatización: Cambiar fase según pasosImportacion
    if (req.body.pasosImportacion) {
      const pasos = req.body.pasosImportacion;
      if (pasos.transporte_españa && current.fase !== 'españa') req.body.fase = 'españa';
      if (pasos.transporte_domicilio && current.estado !== 'completado') req.body.estado = 'completado';
    }

    // Detectar cambio de fase
    if (req.body.fase && req.body.fase !== current.fase) {
      const nuevaFase = req.body.fase === "españa" ? "España (Gestión Nacional)" : "Alemania (Origen)";
      
      // Notificación en la APP
      await Notification.create({
        destinatario: current.cliente._id,
        titulo: "Actualización de Importación",
        mensaje: `Tu vehículo ha pasado a la fase: ${nuevaFase}`,
        tipo: "info",
        leido: false
      }).catch(console.error);

      // Email al cliente
      sendEmail(
        current.cliente.email,
        "Actualización de fase de importación - BAEMIMPORT",
        `Hola ${current.cliente.nombre}, tu vehículo ha pasado a la fase de ${nuevaFase}.`,
        `<h2>¡Buenas noticias!</h2>
         <p>Tu proceso de importación ha avanzado.</p>
         <p><strong>Vehículo:</strong> ${current.vehiculo?.marca || ''} ${current.vehiculo?.modelo || ''}</p>
         <p><strong>Nueva Fase:</strong> ${nuevaFase}</p>
         <p>Puedes consultar los detalles y la documentación en tu panel de cliente.</p>`
      ).catch(console.error);
    }

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("cliente").populate("vehiculo");
    res.json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Pedido eliminado" });
  } catch { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;
