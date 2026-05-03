require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas de autenticacion y usuarios
app.use("/api/auth", require("./routes/auth"));

// Rutas principales del negocio
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/stats", require("./routes/stats"));

// Presupuestos y facturacion
app.use("/api/quotes", require("./routes/quotes"));
app.use("/api/invoices", require("./routes/invoices"));

// Gestion interna
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/notifications", require("./routes/notifications"));

// Herramientas y comunicaciones
app.use("/api/activity", require("./routes/activity"));
app.use("/api/alerts", require("./routes/alerts"));
app.use("/api/calculator", require("./routes/calculator"));
app.use("/api/communication", require("./routes/communication"));
app.use("/api/search", require("./routes/search"));
app.use("/api/email", require("./routes/email"));
app.use("/api/requests", require("./routes/requests"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/automation", require("./routes/automation"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/uploads", require("./routes/uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB conectado");
    app.listen(process.env.PORT || 8080, () => {
      console.log(`Backend en puerto ${process.env.PORT || 8080}`);
    });
  })
  .catch((err) => {
    console.error("Error MongoDB:", err.message);
    process.exit(1);
  });
