
const express = require("express");
const router = express.Router();
const Client = require("../models/Cliente");
const { authMiddleware } = require("../middleware/auth");
const {
  isAdmin,
  isSeller,
  isClient,
  canAccessClient,
} = require("../utils/accessScope");
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

    if (isSeller(req.user)) filtro.vendedorAsignado = req.user._id;
    if (isClient(req.user)) filtro.usuario = req.user._id;

    const clients = await Client.find(filtro)
      .populate("vendedorAsignado", "nombre email")
      .sort({ nombre: 1 });
    res.json(clients);
  } catch { res.status(500).json({ error: "Error al obtener clientes" }); }
});
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate("vendedorAsignado", "nombre email");
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" });
    if (!(await canAccessClient(req.user, client._id))) return res.status(403).json({ error: "Acceso denegado" });
    res.json(client);
  } catch { res.status(500).json({ error: "Error al obtener cliente" }); }
});
router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = { ...req.body };

    // Un cliente no puede crear otros clientes.
    if (isClient(req.user)) return res.status(403).json({ error: "Acceso denegado" });

    // Empleado/vendedor: sus clientes quedan asignados a su usuario.
    if (isSeller(req.user)) payload.vendedorAsignado = req.user._id;

    // Admin puede decidir asignacion; si no la manda, queda sin asignar.
    if (!isAdmin(req.user)) delete payload.usuario;

    const client = await Client.create(payload);
    res.status(201).json(client);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Client.findById(req.params.id);
    if (!current) return res.status(404).json({ error: "Cliente no encontrado" });
    if (!(await canAccessClient(req.user, current._id))) return res.status(403).json({ error: "Acceso denegado" });

    const payload = { ...req.body };
    if (!isAdmin(req.user)) {
      // Solo admin puede reasignar vendedor o vincular usuario cliente manualmente.
      delete payload.vendedorAsignado;
      delete payload.usuario;
    }

    const client = await Client.findByIdAndUpdate(req.params.id, payload, { new: true })
      .populate("vendedorAsignado", "nombre email");
    if (!client) return res.status(404).json({ error: "Cliente no encontrado" });
    res.json(client);
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const current = await Client.findById(req.params.id).select("_id");
    if (!current) return res.status(404).json({ error: "Cliente no encontrado" });
    if (!(await canAccessClient(req.user, current._id))) return res.status(403).json({ error: "Acceso denegado" });
    await Client.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Cliente eliminado" });
  } catch { res.status(500).json({ error: "Error al eliminar" }); }
});

module.exports = router;
