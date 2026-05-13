
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehiculo");
const Client = require("../models/Cliente");
const Order = require("../models/Pedido");
const { authMiddleware } = require("../middleware/auth");
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ vehiculos: [], clientes: [], pedidos: [] });

    const regex = new RegExp(q.trim(), "i");

    const [vehiculos, clientes, pedidos] = await Promise.all([
      Vehicle.find({
        $or: [{ marca: regex }, { modelo: regex }, { vin: regex }, { color: regex }],
      }).select("marca modelo anio estado precio").limit(5),

      Client.find({
        activo: true,
        $or: [{ nombre: regex }, { apellidos: regex }, { email: regex }, { telefono: regex }, { dni: regex }],
      }).select("nombre apellidos telefono email").limit(5),

      Order.find({
        estado: { $ne: "cancelado" },
      }).populate({ path: "cliente", match: { $or: [{ nombre: regex }, { apellidos: regex }] }, select: "nombre apellidos" })
        .populate("vehiculo", "marca modelo")
        .limit(10)
        .then(orders => orders.filter(o => o.cliente)),
    ]);

    res.json({ vehiculos, clientes, pedidos });
  } catch (_err) {
    res.status(500).json({ error: "Error en la búsqueda" });
  }
});

module.exports = router;
