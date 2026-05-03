const jwt = require("jsonwebtoken");
const User = require("../models/Usuario");

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Token invalido o expirado" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.rol !== "admin") return res.status(403).json({ error: "Acceso restringido a administradores" });
  next();
};

module.exports = { authMiddleware, adminMiddleware };
