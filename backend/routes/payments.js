
const express = require("express");
const router = express.Router();
const Payment = require("../models/Pago");
const Order = require("../models/Pedido");
const { authMiddleware } = require("../middleware/auth");

// Registrar un nuevo pago
// Endpoint: POST /
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { pedido, monto, metodo, concepto } = req.body;
    
    const order = await Order.findById(pedido);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

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
// Endpoint: GET /pedido/:orderId
router.get("/pedido/:orderId", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ pedido: req.params.orderId }).sort({ fecha: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
