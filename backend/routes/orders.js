
const express = require("express");
const router = express.Router();
const Order = require("../models/Pedido");
const Notification = require("../models/Notificacion");
const Client = require("../models/Cliente");
const { authMiddleware } = require("../middleware/auth");
const emailService = require("../services/email");
const { sendEmail } = require("../services/email");

// Endpoint: GET /
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { estado, cliente } = req.query;
    const filtro = {};
    if (estado) filtro.estado = estado;

    // Si es cliente: solo ve sus pedidos a traves del vinculo Client.usuario -> User
    if (req.user.rol === "cliente") {
      const clientObj = await Client.findOne({ usuario: req.user._id }).select("_id");
      if (!clientObj) return res.json([]);
      filtro.cliente = clientObj._id;
    } else if (cliente) {
      filtro.cliente = cliente;
    }

    const orders = await Order.find(filtro)
      .populate("cliente", "nombre apellidos email telefono usuario")
      .populate("vehiculo", "marca modelo anio combustible transmision precio color")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

// Endpoint: GET /:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("cliente")
      .populate("vehiculo")
      .populate("creadoPor", "nombre");
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    // Si es cliente, validar ownership
    if (req.user.rol === "cliente") {
      const clientObj = await Client.findOne({ usuario: req.user._id }).select("_id");
      if (!clientObj || String(order.cliente?._id) !== String(clientObj._id)) {
        return res.status(403).json({ error: "Acceso denegado" });
      }
    }

    res.json(order);
  } catch {
    res.status(500).json({ error: "Error al obtener pedido" });
  }
});

// Endpoint: POST /
router.post("/", authMiddleware, async (req, res) => {
  try {
    const data = { ...req.body, creadoPor: req.user._id };
    data.restante = (parseFloat(data.precioFinal) || 0) - (parseFloat(data.senial) || 0);
    const order = await Order.create(data);
    const populated = await Order.findById(order._id).populate("cliente").populate("vehiculo");

    // Automatizacion: Registrar el pago inicial si existe senial
    if (parseFloat(data.senial) > 0) {
      const Payment = require("../models/Pago");
      await Payment.create({
        pedido: order._id,
        cliente: data.cliente,
        monto: data.senial,
        metodo: data.metodoPago || "Transferencia bancaria",
        concepto: "Pago inicial / Senial",
      }).catch(console.error);
    }

    // Automatizacion: Crear tareas estandar para el nuevo pedido
    const Task = require("../models/Tarea");
    const tareasEstandar = [
      { titulo: "Verificar documentacion origen (Alemania)", categoria: "Documentacion", prioridad: "alta" },
      { titulo: "Gestionar transporte internacional", categoria: "Importacion", prioridad: "normal" },
      { titulo: "Revisar pago de senial", categoria: "Financiero", prioridad: "urgente" },
    ];
    for (const t of tareasEstandar) {
      await Task.create({
        ...t,
        pedido: order._id,
        asignadoA: req.user._id,
        creadoPor: req.user._id,
        fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).catch(console.error);
    }

    // Email confirmacion
    try {
      await emailService.confirmacionPedido(populated, populated.cliente, populated.vehiculo);
    } catch (_e) {}

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint: PUT /:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Order.findById(req.params.id).populate("cliente").populate("vehiculo");
    if (!current) return res.status(404).json({ error: "Pedido no encontrado" });

    // Si es cliente, validar ownership
    if (req.user.rol === "cliente") {
      const clientObj = await Client.findOne({ usuario: req.user._id }).select("_id");
      if (!clientObj || String(current.cliente?._id) !== String(clientObj._id)) {
        return res.status(403).json({ error: "Acceso denegado" });
      }
    }

    if (req.body.precioFinal !== undefined || req.body.senial !== undefined) {
      const precio = parseFloat(req.body.precioFinal ?? current.precioFinal) || 0;
      const senial = parseFloat(req.body.senial ?? current.senial) || 0;
      req.body.restante = precio - senial;
    }

    // Automatizacion: Cambiar fase segun pasosImportacion
    if (req.body.pasosImportacion) {
      const pasos = req.body.pasosImportacion;
      // Compat: aceptar claves antiguas con caracteres especiales si existieran
      const transporteEspana = pasos.transporte_espana || pasos.transporte_españa;
      if (transporteEspana && current.fase !== "espana") req.body.fase = "espana";
      if (pasos.transporte_domicilio && current.estado !== "completado") req.body.estado = "completado";
    }

    // Notificar cambio de fase (APP + email)
    if (req.body.fase && req.body.fase !== current.fase) {
      const nuevaFase = req.body.fase === "espana" ? "Espana (Gestion Nacional)" : "Alemania (Origen)";

      const clientDoc = await Client.findById(current.cliente?._id).select("usuario email nombre").lean();
      if (clientDoc?.usuario) {
        await Notification.create({
          destinatario: clientDoc.usuario,
          titulo: "Actualizacion de importacion",
          mensaje: `Tu vehiculo ha pasado a la fase: ${nuevaFase}`,
          tipo: "info",
          leido: false,
        }).catch(console.error);
      }

      if (clientDoc?.email) {
        sendEmail(
          clientDoc.email,
          "Actualizacion de fase de importacion - BAEMIMPORT",
          `Hola ${clientDoc.nombre || ""}, tu vehiculo ha pasado a la fase de ${nuevaFase}.`,
          `<h2>Actualizacion</h2>
           <p>Tu proceso de importacion ha avanzado.</p>
           <p><strong>Vehiculo:</strong> ${current.vehiculo?.marca || ""} ${current.vehiculo?.modelo || ""}</p>
           <p><strong>Nueva fase:</strong> ${nuevaFase}</p>`,
        ).catch(console.error);
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("cliente")
      .populate("vehiculo");
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint: DELETE /:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Pedido eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar" });
  }
});

module.exports = router;
