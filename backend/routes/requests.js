
const express = require("express");
const router = express.Router();
const VehicleRequest = require("../models/SolicitudVehiculo");
const Notification = require("../models/Notificacion");
const User = require("../models/Usuario");
const { authMiddleware } = require("../middleware/auth");
const { sendEmail } = require("../services/email");

// Crear solicitud (Cliente)
router.post("/", authMiddleware, async (req, res) => {
  console.log("Nueva solicitud recibida:", req.body);
  try {
    const request = new VehicleRequest({ ...req.body, cliente: req.user._id });
    await request.save();

    // Notificacion interna (campana) para admins/vendedores
    // (no bloquea la respuesta al cliente)
    (async () => {
      try {
        const internos = await User.find({ rol: { $in: ["admin", "vendedor"] }, activo: true })
          .select("_id")
          .lean();
        if (!internos.length) return;
        const titulo = "Nueva solicitud de vehiculo";
        const mensaje = `${req.user.nombre || "Cliente"} solicito: ${req.body.marca || ""} ${req.body.modelo || ""}`.trim();
        // Crear una por una para que se ejecuten los hooks del modelo (email).
        await Promise.all(
          internos.map((u) =>
            Notification.create({
              destinatario: u._id,
              titulo,
              mensaje,
              tipo: "info",
              enlace: "/inbox",
            }).catch(() => null)
          )
        );
      } catch (e) {
        console.error("Error creando notificacion interna:", e.message);
      }
    })();

    // Notificar a la empresa (sin bloquear el resto del proceso)
    sendEmail(
      process.env.MAIL_USER,
      `Nueva Solicitud de Vehículo: ${req.body.marca} ${req.body.modelo}`,
      `Se ha recibido una nueva solicitud de un cliente.

Cliente: ${req.user.nombre}
Email: ${req.user.email}
Vehículo: ${req.body.marca} ${req.body.modelo}
Presupuesto: ${req.body.presupuesto} EUR`,
      `<h2>Nueva Solicitud de Vehículo</h2>
       <p><strong>Cliente:</strong> ${req.user.nombre}</p>
       <p><strong>Email:</strong> ${req.user.email}</p>
       <p><strong>Vehículo:</strong> ${req.body.marca} ${req.body.modelo}</p>
       <p><strong>Presupuesto:</strong> ${req.body.presupuesto} EUR</p>
       <p><strong>Extras:</strong> ${req.body.extras || 'Ninguno'}</p>`
    ).catch(e => console.error("Error email empresa:", e.message));

    // Confirmación al cliente (sin bloquear)
    sendEmail(
      req.user.email,
      "Confirmación de Solicitud de Vehículo - BAEMIMPORT",
      `Hola ${req.user.nombre}, hemos recibido tu solicitud para un ${req.body.marca} ${req.body.modelo}. Un asesor se pondrá en contacto contigo pronto.`,
      `<h2>Hola ${req.user.nombre},</h2>
       <p>Hemos recibido correctamente tu solicitud de búsqueda para un <strong>${req.body.marca} ${req.body.modelo}</strong>.</p>
       <p>Nuestro equipo de importación está revisando los requisitos y un asesor se pondrá en contacto contigo a la mayor brevedad posible.</p>
       <p>Gracias por confiar en BAEMIMPORT.</p>`
    ).catch(e => console.error("Error email cliente:", e.message));

    res.status(201).json(request);
  } catch (err) { 
    console.error("Error en solicitud/email:", err);
    res.status(400).json({ error: err.message }); 
  }
});

// Obtener todas las solicitudes (Vendedor/Admin)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const requests = await VehicleRequest.find().populate("cliente", "nombre email").sort("-createdAt");
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Actualizar estado (Vendedor)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const request = await VehicleRequest.findByIdAndUpdate(req.params.id, { estado: req.body.estado }, { new: true });
    res.json(request);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
