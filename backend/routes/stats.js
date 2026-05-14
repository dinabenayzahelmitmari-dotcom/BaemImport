
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehiculo");
const Order = require("../models/Pedido");
const Client = require("../models/Cliente");
const { authMiddleware } = require("../middleware/auth");
const {
  getAccessibleClientIds,
  toObjectId,
  getAccessibleVehicleScope,
} = require("../utils/accessScope");
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const vehicleScope = await getAccessibleVehicleScope(req.user);
    const clientIds = await getAccessibleClientIds(req.user);
    const scopedClientIds = clientIds === null ? null : clientIds.map((id) => toObjectId(id)).filter(Boolean);
    const orderScope = scopedClientIds === null ? {} : { cliente: { $in: scopedClientIds } };

    const [
      vehiculosTotal, vehiculosDisponibles, vehiculosReservados, vehiculosVendidos, vehiculosTransito,
      pedidosTotal, pedidosPendientes, pedidosCompletados,
      clientesTotal,
      ultimosPedidos,
    ] = await Promise.all([
      Vehicle.countDocuments(vehicleScope),
      Vehicle.countDocuments({ ...vehicleScope, estado: "disponible" }),
      Vehicle.countDocuments({ ...vehicleScope, estado: "reservado" }),
      Vehicle.countDocuments({ ...vehicleScope, estado: "vendido" }),
      Vehicle.countDocuments({ ...vehicleScope, estado: "en_transito" }),
      Order.countDocuments(orderScope),
      Order.countDocuments({ ...orderScope, estado: { $in: ["confirmado", "en_gestion"] } }),
      Order.countDocuments({ ...orderScope, estado: "completado" }),
      scopedClientIds === null ? Client.countDocuments() : Client.countDocuments({ _id: { $in: scopedClientIds } }),
      Order.find(orderScope).sort({ createdAt: -1 }).limit(5)
        .populate("cliente", "nombre apellidos")
        .populate("vehiculo", "marca modelo anio"),
    ]);

    // Ventas del mes actual
    const primerDiaMes = new Date();
    primerDiaMes.setDate(1); primerDiaMes.setHours(0,0,0,0);
    const ventasMesMatch = { ...orderScope, estado: "completado", createdAt: { $gte: primerDiaMes } };
    const ventasMesData = await Order.aggregate([
      { $match: ventasMesMatch },
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
