
const express = require("express");
const router = express.Router();
const Message = require("../models/Mensaje");
const User = require("../models/Usuario");
const { authMiddleware } = require("../middleware/auth");

// Enviar mensaje
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { destinatario, texto } = req.body;
    const message = new Message({
      remitente: req.user._id,
      destinatario,
      texto
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Obtener mensajes con un usuario específico
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { remitente: req.user._id, destinatario: req.params.userId },
        { remitente: req.params.userId, destinatario: req.user._id }
      ]
    }).sort("createdAt");
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Obtener lista de contactos (Usuarios con los que se ha hablado)
router.get("/contacts/list", authMiddleware, async (req, res) => {
  try {
    const userRole = req.user.rol;
    let contacts;
    if (userRole === 'cliente') {
      // Los clientes hablan con vendedores/admins/empleados
      contacts = await User.find({ rol: { $in: ['vendedor', 'admin', 'empleado'] } }, "nombre rol");
    } else {
      // Los vendedores ven a los clientes con los que hay mensajes o todos los clientes
      contacts = await User.find({ rol: 'cliente' }, "nombre email");
    }
    res.json(contacts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
