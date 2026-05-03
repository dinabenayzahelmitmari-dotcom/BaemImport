const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehiculo");
const Order = require("../models/Pedido");
const Client = require("../models/Clienteee");
const { authMiddleware } = require("../middleware/auth");

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const [
      vehiculosTotal, vehiculosDisponibles, vehiculosReservados, vehiculosVendidos, vehiculosTransito,
      pedidosTotal, pedidosPendientes, pedidosCompletados,
      clientesTotal,
      ultimosPedidos,
    ] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ estado: "disponible" }),
      Vehicle.countDocuments({ estado: "reservado" }),
      Vehicle.countDocuments({ estado: "vendido" }),
      Vehicle.countDocuments({ estado: "en_transito" }),
      Order.countDocuments(),
      Order.countDocuments({ estado: { $in: ["confirmado", "en_gestion"] } }),
      Order.countDocuments({ estado: "completado" }),
      Client.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5)
        .populate("cliente", "nombre apellidos")
        .populate("vehiculo", "marca modelo anio"),
    ]);

    // Ventas del mes actual
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1); primerDiaMes.setHours(0,0,0,0);
    const ventasMesData = await Order.aggregate([
      { $match: { estado: "completado", createdAt: { $gte: primerDiaMes } } },
      { $group: { _id: null, total: { $sum: "$precioFinal" } } },
    ]);
    const ventasMes = ventasMesData[0]?.total || 0;

    res.json({
      vehiculos: { total: vehiculosTotal, disponibles: vehiculosDisponibles, reservados: vehiculosReservados, vendidos: vehiculosVendidos, en_transito: vehiculosTransito },
      pedidos: { total: pedidosTotal, pendientes: pedidosPendientes, completados: pedidosCompletados },
      clientes: { total: clientesTotal },
      ventasMes,
      ultimosPedidos,
    });
  } catch (err) { res.status(500).json({ error: "Error al obtener estadisticas: " + err.message }); }
});

module.exports = router;
