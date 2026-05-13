
const jwt = require("jsonwebtoken");
const User = require("../models/Usuario");

const authMiddleware = async (req, res, next) => {
  try {
    // 1) Lee el header Authorization con el formato: "Bearer <token>"
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "No autorizado" });
    const token = header.split(" ")[1];

    // 2) Valida y decodifica el JWT con la clave del servidor
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Carga el usuario y lo adjunta al request para que lo use el resto de handlers
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });
    req.user = user;
    next();
  } catch {
    // JWT invalido, expirado o con firma incorrecta
    res.status(401).json({ error: "Token invalido o expirado" });
  }
};

const adminMiddleware = (req, res, next) => {
  // Requiere que authMiddleware haya poblado req.user y que el rol sea "admin"
  if (req.user?.rol !== "admin") return res.status(403).json({ error: "Acceso restringido a administradores" });
  next();
};

module.exports = { authMiddleware, adminMiddleware };
