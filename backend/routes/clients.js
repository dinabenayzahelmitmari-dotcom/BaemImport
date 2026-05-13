
const express = require("express");
const router = express.Router();
const Client = require("../models/Cliente");
const { authMiddleware } = require("../middleware/auth");

// Endpoint: GET /
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    const filtro = {};
    if (search) {
      filtro.$or = [
        { nombre: new RegExp(search, "i") },
        { apellidos: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { telefono: new RegExp(search, "i") },
        { dni: new RegExp(search, "i") },
      ];
    }
    const clients = await Client.find(filtro).sort({ nombre: 1 });
    res.json(clients);
  } catch { res.status(500).json({ error: "Error al obtener clientes" }); }
});

// Endpoint: GET /:id
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(client);
  } catch { res.status(500).json({ error: "Error al obtener cliente" }); }
});

// Endpoint: POST /
router.post("/", authMiddleware, async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Endpoint: PUT /:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(client);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Endpoint: DELETE /:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Cliente eliminado" });
  } catch { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;
