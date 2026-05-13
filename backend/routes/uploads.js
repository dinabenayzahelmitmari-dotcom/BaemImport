
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Order = require("../models/Pedido");
const { authMiddleware } = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });
router.post("/:orderId/:fase", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    const { orderId, fase } = req.params;
    const { nombre } = req.body;
    
    if (!req.file) return res.status(400).json({ error: "No se ha subido ningún archivo" });

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    const nuevoDoc = {
      nombre: nombre || req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      fecha: new Date()
    };

    if (fase === "alemania") order.documentos.alemania.push(nuevoDoc);
    else if (fase === "espania" || fase === "españa") order.documentos.espania.push(nuevoDoc);
    else return res.status(400).json({ error: "Fase no válida" });

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
