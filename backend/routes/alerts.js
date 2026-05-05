const express = require("express");
const router = express.Router();
const Order = require("../models/Pedido");
const Vehicle = require("../models/Vehiculo");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const alertas = [];
    const ahora = new Date();
    const en3Dias = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);
    const hace15Dias = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000);
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Pedidos con entrega inminente (<=3 días)
    const entregasInminentes = await Order.find({
      estado: { $in: ["confirmado", "en_gestion"] },
      fechaEntregaEstimada: { $lte: en3Dias, $gte: ahora },
    }).populate("cliente", "nombre apellidos").populate("vehiculo", "marca modelo");

    entregasInminentes.forEach(o => {
      const dias = Math.ceil((new Date(o.fechaEntregaEstimada) - ahora) / (1000 * 60 * 60 * 24));
      alertas.push({
        tipo: "urgente",
        icono: "entrega",
        titulo: "Entrega inminente",
        mensaje: `${o.vehiculo?.marca} ${o.vehiculo?.modelo} para ${o.cliente?.nombre} — en ${dias} día${dias === 1 ? '' : 's'}`,
        pedidoId: o._id,
      });
    });

    // Pedidos con entrega vencida
    const entregasVencidas = await Order.find({
      estado: { $in: ["confirmado", "en_gestion"] },
      fechaEntregaEstimada: { $lt: ahora },
    }).populate("cliente", "nombre apellidos").populate("vehiculo", "marca modelo");

    entregasVencidas.forEach(o => {
      alertas.push({
        tipo: "error",
        icono: "vencido",
        titulo: "Entrega vencida",
        mensaje: `${o.vehiculo?.marca} ${o.vehiculo?.modelo} para ${o.cliente?.nombre} — fecha superada`,
        pedidoId: o._id,
      });
    });

    // Pedidos parados más de 15 días en presupuesto
    const presupuestosParados = await Order.find({
      estado: "presupuesto",
      updatedAt: { $lt: hace15Dias },
    }).populate("cliente", "nombre apellidos").populate("vehiculo", "marca modelo");

    presupuestosParados.forEach(o => {
      alertas.push({
        tipo: "aviso",
        icono: "parado",
        titulo: "Presupuesto sin confirmar",
        mensaje: `${o.cliente?.nombre} — sin actividad hace más de 15 días`,
        pedidoId: o._id,
      });
    });

    // Vehículos disponibles sin movimiento > 30 días
    const vehiculosParados = await Vehicle.find({
      estado: "disponible",
      updatedAt: { $lt: hace30Dias },
    });

    vehiculosParados.forEach(v => {
      alertas.push({
        tipo: "info",
        icono: "vehiculo",
        titulo: "Vehículo sin actividad",
        mensaje: `${v.marca} ${v.modelo} (${v.anio}) lleva más de 30 días disponible`,
        vehiculoId: v._id,
      });
    });

    res.json(alertas);
  } catch (_err) {
    res.status(500).json({ error: "Error al calcular alertas" });
  }
});

module.exports = router;
