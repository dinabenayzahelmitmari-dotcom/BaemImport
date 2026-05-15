
const express = require("express");
const router = express.Router();
const Message = require("../models/Mensaje");
const User = require("../models/Usuario");
const Client = require("../models/Cliente");
const { authMiddleware } = require("../middleware/auth");
const { isSeller } = require("../utils/accessScope");

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
    if (userRole === "cliente") {
      // El cliente prioriza a su vendedor asignado y a las conversaciones ya iniciadas.
      const clientRecord = await Client.findOne({ usuario: req.user._id }).select("vendedorAsignado");
      const relatedMessages = await Message.find({
        $or: [
          { remitente: req.user._id },
          { destinatario: req.user._id },
        ],
      }).sort({ createdAt: -1 }).select("remitente destinatario");
      const messagedUserIds = relatedMessages.flatMap((message) => {
        const ids = [];
        if (String(message.remitente) !== String(req.user._id)) ids.push(String(message.remitente));
        if (String(message.destinatario) !== String(req.user._id)) ids.push(String(message.destinatario));
        return ids;
      });
      const prioritizedIds = [];
      if (clientRecord?.vendedorAsignado) prioritizedIds.push(String(clientRecord.vendedorAsignado));
      prioritizedIds.push(...messagedUserIds);
      const uniquePrioritizedIds = [...new Set(prioritizedIds)];
      const prioritizedContacts = uniquePrioritizedIds.length > 0
        ? await User.find({
          _id: { $in: uniquePrioritizedIds },
          rol: { $in: ["vendedor", "admin"] },
        }, "nombre email rol")
        : [];
      const fallbackContacts = await User.find({
        rol: { $in: ["vendedor", "admin"] },
        _id: { $nin: uniquePrioritizedIds },
      }, "nombre email rol").sort({ nombre: 1 });
      const orderedPrioritized = uniquePrioritizedIds
        .map((id) => prioritizedContacts.find((contact) => String(contact._id) === id))
        .filter(Boolean);
      contacts = [...orderedPrioritized, ...fallbackContacts];
    } else if (isSeller(req.user)) {
      // El vendedor ve clientes asignados y tambien clientes con los que ya tiene mensajes.
      const clients = await Client.find({
        vendedorAsignado: req.user._id,
        usuario: { $exists: true, $ne: null },
      }).select("usuario");
      const assignedUserIds = clients.map((c) => String(c.usuario));
      const relatedMessages = await Message.find({
        $or: [
          { remitente: req.user._id },
          { destinatario: req.user._id },
        ],
      }).sort({ createdAt: -1 }).select("remitente destinatario");
      const messagedUserIds = relatedMessages.flatMap((message) => {
        const ids = [];
        if (String(message.remitente) !== String(req.user._id)) ids.push(String(message.remitente));
        if (String(message.destinatario) !== String(req.user._id)) ids.push(String(message.destinatario));
        return ids;
      });
      const userIds = [...new Set([...assignedUserIds, ...messagedUserIds])];
      contacts = await User.find({ _id: { $in: userIds }, rol: "cliente" }, "nombre email");
    } else {
      contacts = await User.find({ rol: "cliente" }, "nombre email");
    }
    res.json(contacts);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
