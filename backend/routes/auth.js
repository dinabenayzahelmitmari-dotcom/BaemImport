
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Usuario");
const Client = require("../models/Cliente");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y contrasena requeridos" });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });
    if (user.activo === false) return res.status(403).json({ error: "Usuario desactivado" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciales incorrectas" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { _id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (_err) { res.status(500).json({ error: "Error al iniciar sesion" }); }
});
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: "Todos los campos son obligatorios" });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Ya existe un usuario con ese email" });

    // Registro publico: solo cliente o vendedor (nunca admin).
    const publicRole = rol === "vendedor" ? "vendedor" : "cliente";
    const user = await User.create({ nombre, email: email.toLowerCase(), password, rol: publicRole });

    // Solo clientes tienen ficha de cliente vinculada.
    if (publicRole === "cliente") {
      const existingClient = await Client.findOne({ email: email.toLowerCase() });
      if (existingClient) {
        if (!existingClient.usuario) {
          existingClient.usuario = user._id;
          await existingClient.save();
        }
      } else {
        await Client.create({
          usuario: user._id,
          nombre,
          email: email.toLowerCase(),
        });
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { _id: user._id, nombre: user.nombre, email: user.email, rol: user.rol } });
  } catch (err) { res.status(400).json({ error: err.message }); }
});
router.get("/me", authMiddleware, async (req, res) => {
  res.json({ _id: req.user._id, nombre: req.user.nombre, email: req.user.email, rol: req.user.rol });
});

// Admin: list users
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: 1 });
    res.json(users);
  } catch { res.status(500).json({ error: "Error" }); }
});

// Admin: list employees/sellers
router.get("/users/sellers", authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const sellers = await User.find({ rol: "vendedor", activo: { $ne: false } }, "nombre email rol").sort({ nombre: 1 });
    res.json(sellers);
  } catch {
    res.status(500).json({ error: "Error" });
  }
});

// Admin: create user (admin or seller)
router.post("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    const allowedRoles = ["admin", "vendedor"];
    const finalRole = allowedRoles.includes(rol) ? rol : "vendedor";
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "Ya existe un usuario con ese email" });

    const user = await User.create({
      nombre,
      email: email.toLowerCase(),
      password,
      rol: finalRole,
    });
    res.status(201).json({ _id: user._id, nombre: user.nombre, email: user.email, rol: user.rol });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: update user
router.put("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { rol, nombre } = req.body;
    const update = {};
    if (rol) {
      const allowedRoles = ["admin", "vendedor", "cliente"];
      if (!allowedRoles.includes(rol)) return res.status(400).json({ error: "Rol no valido" });
      update.rol = rol;
    }
    if (nombre) update.nombre = nombre;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true, select: "-password" },
    );
    res.json(user);
  } catch { res.status(500).json({ error: "Error" }); }
});

// Admin: delete user
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ mensaje: "Usuario eliminado" });
  } catch { res.status(500).json({ error: "Error" }); }
});

module.exports = router;
