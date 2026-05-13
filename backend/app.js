 * Express app factory (no side effects like listening or DB connections).
 * Keeping this separate from server.js makes the backend testable and easier
 * to deploy (server.js becomes the runtime entrypoint).

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads (local storage)
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // API routes
  app.use("/api/auth", require("./routes/auth"));

  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/vehicles", require("./routes/vehicles"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/clients", require("./routes/clients"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/orders", require("./routes/orders"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/stats", require("./routes/stats"));

  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/quotes", require("./routes/quotes"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/invoices", require("./routes/invoices"));

  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/expenses", require("./routes/expenses"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/tasks", require("./routes/tasks"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/notifications", require("./routes/notifications"));

  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/activity", require("./routes/activity"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/alerts", require("./routes/alerts"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/calculator", require("./routes/calculator"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/communication", require("./routes/communication"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/search", require("./routes/search"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/email", require("./routes/email"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/requests", require("./routes/requests"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/chat", require("./routes/chat"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/automation", require("./routes/automation"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/payments", require("./routes/payments"));
  // Registra un modulo de rutas bajo su prefijo de API.
  app.use("/api/uploads", require("./routes/uploads"));

  // Serve frontend build (production / exe): prueba varias ubicaciones posibles.
  const exeDir = path.dirname(process.execPath || "");
  const frontendBuildCandidates = [
    path.join(__dirname, "..", "frontend", "build"),
    path.join(__dirname, "frontend", "build"),
    path.join(process.cwd(), "frontend", "build"),
    path.join(exeDir, "frontend", "build"),
    path.join(exeDir, "build"),
  ];
  const frontendBuildDir = frontendBuildCandidates.find((dir) => fs.existsSync(dir));
  if (frontendBuildDir) {
    app.use(express.static(frontendBuildDir));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(frontendBuildDir, "index.html"));
    });
  } else {
    // Sin build del frontend disponible, el backend sigue operativo via /api.
    console.warn("[app] Frontend build no encontrado. Se servira solo API.");
  }

  return app;
}

module.exports = { createApp };
