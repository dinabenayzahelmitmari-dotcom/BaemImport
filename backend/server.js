/**
 * Backend entrypoint.
 * - Loads backend/.env explicitly (so it works from monorepo root and when packaged).
 * - Connects to MongoDB with retry (friendlier for local .exe usage).
 * - Serves React build in production (single-process deployment).
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const { exec } = require("child_process");

// pkg workaround: ensure this entry is traced into the executable snapshot
// (some dependency paths are resolved via package "exports" and can be missed).
try { require("es-get-iterator/node.js"); } catch {}

// Asegura que los indices (unique/sparse) se creen automaticamente en entornos locales.
mongoose.set("autoIndex", true);

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

// Servir el frontend compilado (produccion).
// Esto permite empaquetar un solo ejecutable: el backend sirve el build de React.
const frontendBuildDir = path.join(__dirname, "..", "frontend", "build");
if (fs.existsSync(frontendBuildDir)) {
  app.use(express.static(frontendBuildDir));
  app.get("*", (req, res) => {
    // No interceptar API ni uploads
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
      return res.status(404).json({ error: "Not found" });
    }
    res.sendFile(path.join(frontendBuildDir, "index.html"));
  });
}

const basePort = Number(process.env.PORT) || 8080;
const maxPortAttempts = 20;
let browserOpened = false;

function openBrowser(url) {
  if (browserOpened) return;
  browserOpened = true;

  // Allow disabling in edge cases (CI, servers, etc.)
  if (String(process.env.OPEN_BROWSER || "1") === "0") return;

  if (process.platform === "win32") {
    exec(`start "" "${url}"`);
    return;
  }
  if (process.platform === "darwin") {
    exec(`open "${url}"`);
    return;
  }
  exec(`xdg-open "${url}"`);
}

const tryListen = (port, attempt = 0) => {
  const server = app.listen(port, () => {
    console.log(`Backend en puerto ${port}`);
    if (port !== basePort) {
      console.log(`Puerto ${basePort} estaba en uso. Usando ${port}.`);
    }
    // Abrir navegador una vez sepamos el puerto definitivo
    openBrowser(`http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err && err.code === "EADDRINUSE" && attempt < maxPortAttempts) {
      const nextPort = port + 1;
      console.log(`Puerto ${port} en uso, probando ${nextPort}...`);
      tryListen(nextPort, attempt + 1);
      return;
    }
    console.error("Error al iniciar servidor:", err?.message || err);
    process.exit(1);
  });
};

async function connectMongoWithRetry() {
  const uri = process.env.MONGO_URI;
  // Reintenta indefinidamente: para un .exe es mejor esperar a que Mongo arranque
  // que terminar silenciosamente.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await mongoose.connect(uri);
      console.log("MongoDB conectado");
      return;
    } catch (err) {
      const msg = err?.message || String(err);
      console.error("Error MongoDB:", msg);
      console.error("Asegurate de que MongoDB esta arrancado y accesible en MONGO_URI.");
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

connectMongoWithRetry().then(() => {
  tryListen(basePort);
});
