
const express = require("express");
const router = express.Router();
const VehicleRequest = require("../models/SolicitudVehiculo");
const Vehicle = require("../models/Vehiculo");
const Order = require("../models/Pedido");
const { authMiddleware } = require("../middleware/auth");

// Convertir solicitud en pedido (Automatización integral)
// Endpoint: POST /convert/:requestId
router.post("/convert/:requestId", authMiddleware, async (req, res) => {
  try {
    const request = await VehicleRequest.findById(req.params.requestId).populate("cliente");
    if (!request) return res.status(404).json({ error: "Solicitud no encontrada" });

    // 1. Crear el vehículo en el inventario
    const vehicle = new Vehicle({
      marca: request.marca,
      modelo: request.modelo,
      anio: request.anioDesde || new Date().getFullYear(),
      precio: request.presupuesto,
      estado: "reservado",
      ubicacion: "Alemania",
      combustible: request.combustible || "Diésel",
      transmision: request.transmision || "Automático"
    });
    await vehicle.save();

    // 2. Crear el pedido vinculado
    const order = new Order({
      cliente: request.cliente._id,
      vehiculo: vehicle._id,
      precioFinal: request.presupuesto,
      estado: "en_gestion",
      fase: "alemania",
      creadoPor: req.user._id,
      pasosImportacion: {
        vehiculo_localizado: true // Ya lo hemos convertido, así que está localizado
      }
    });
    await order.save();

    // 3. Marcar solicitud como finalizada
    request.estado = "convertido";
    await request.save();

    res.status(201).json({ orderId: order._id, vehicleId: vehicle._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
