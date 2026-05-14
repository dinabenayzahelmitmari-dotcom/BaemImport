
const express = require("express");
const router = express.Router();
const Payment = require("../models/Pago");
const Order = require("../models/Pedido");
const { authMiddleware } = require("../middleware/auth");
const { canAccessClient } = require("../utils/accessScope");

// Registrar un nuevo pago
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { pedido, monto, metodo, concepto } = req.body;
    
    const order = await Order.findById(pedido);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    if (!(await canAccessClient(req.user, order.cliente))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const payment = new Payment({
      pedido,
      cliente: order.cliente,
      monto,
      metodo,
      concepto
    });
    await payment.save();

    // Actualizar el saldo del pedido automáticamente
    order.senial += parseFloat(monto);
    order.restante = order.precioFinal - order.senial;
    await order.save();

    res.status(201).json({ payment, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener pagos de un pedido
router.get("/pedido/:orderId", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select("cliente");
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
    if (!(await canAccessClient(req.user, order.cliente))) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    const payments = await Payment.find({ pedido: req.params.orderId }).sort({ fecha: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
