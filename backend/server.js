/**
 * Entry point de runtime: carga .env, conecta MongoDB y levanta HTTP.
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const { exec } = require("child_process");
const { createApp } = require("./app");

// pkg workaround: ensure this entry is traced into the executable snapshot.
try {
  require("es-get-iterator/node.js");
} catch (_e) {}

// Asegura que los indices (unique/sparse) se creen automaticamente en entornos locales.
mongoose.set("autoIndex", true);

const app = createApp();

const basePort = Number(process.env.PORT) || 8080;
// Bind to all interfaces when requested (LAN/Internet access).
// Leave undefined to keep Node's default behavior.
const host =
  process.env.HOST && String(process.env.HOST).trim()
    ? String(process.env.HOST).trim()
    : undefined;
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
  const server = app.listen(port, host, () => {
    const bind = host || "default";
    console.log(`Backend en ${bind}:${port}`);
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
  while (true) {
    try {
      await mongoose.connect(uri);
      console.log("MongoDB conectado");
      return;
      } catch (err) {
        const msg = err?.message || String(err);
        console.error("Error MongoDB:", msg);
        console.error("Asegúrate de que MongoDB está arrancado y accesible en MONGO_URI.");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

connectMongoWithRetry().then(() => {
  tryListen(basePort);
});
