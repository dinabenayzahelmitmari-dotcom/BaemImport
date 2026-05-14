const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const { spawn } = require("child_process");

const User = require("../models/Usuario");
const Client = require("../models/Cliente");

function normalizeRole(role) {
  const value = String(role || "").trim().toLowerCase();
  if (value === "admin" || value === "administrador") return "admin";
  if (value === "vendedor" || value === "empleado" || value === "usuario") return "vendedor";
  return "cliente";
}

function mapRequestStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "asignada" || value === "contactado") return "contactado";
  if (value === "en revision" || value === "en revisión") return "en_revision";
  if (value === "finalizada" || value === "finalizado") return "finalizado";
  return "pendiente";
}

async function readLegacyState(db) {
  const readAll = async (name) => db.collection(name).find({}).toArray().catch(() => []);
  return {
    usuarios: await readAll("usuarios"),
    solicitudvehiculos: await readAll("solicitudvehiculos"),
    conversacions: await readAll("conversacions"),
  };
}

async function clearCurrentState(db) {
  const collections = [
    "users",
    "clients",
    "vehicles",
    "orders",
    "quotes",
    "invoices",
    "tasks",
    "notifications",
    "payments",
    "messages",
    "vehiclerequests",
    "activities",
  ];

  for (const name of collections) {
    await db.collection(name).deleteMany({}).catch(() => null);
  }
}

async function migrateLegacyUsers(db, legacyUsers) {
  const docs = legacyUsers.map((user) => ({
    _id: user._id,
    nombre: user.nombre,
    email: String(user.email || "").toLowerCase(),
    password: user.passwordHash,
    rol: normalizeRole(user.rol),
    activo: user.activo !== false,
    createdAt: user.fechaRegistro || new Date(),
    updatedAt: user.fechaRegistro || new Date(),
    __v: user.__v || 0,
  }));

  if (docs.length) {
    await db.collection("users").insertMany(docs, { ordered: false }).catch((err) => {
      if (err?.code !== 11000) throw err;
    });
  }
}

async function migrateLegacyClients(legacyUsers, legacyRequests) {
  const clientUsers = legacyUsers.filter((user) => normalizeRole(user.rol) === "cliente");

  for (const user of clientUsers) {
    const relatedRequest = legacyRequests.find((req) => String(req.clienteId) === String(user._id));
    const existing = await Client.findOne({ usuario: user._id });
    if (existing) continue;

    await Client.create({
      usuario: user._id,
      vendedorAsignado: relatedRequest?.vendedorId || undefined,
      nombre: user.nombre,
      email: String(user.email || "").toLowerCase(),
      origen: "otro",
    });
  }
}

async function migrateLegacyRequests(db, legacyRequests) {
  for (const req of legacyRequests) {
    await db.collection("vehiclerequests").updateOne(
      { _id: req._id },
      {
        $set: {
          cliente: req.clienteId,
          marca: req.marcaPreferida || "",
          modelo: req.modeloPreferido || "",
          anioDesde: req.anioMinimo || null,
          presupuesto: req.presupuestoMaximo || null,
          combustible: req.combustible || "",
          transmision: req.cambio || "",
          extras: [
            req.equipamientoObligatorio,
            req.equipamientoDeseable,
            req.colorPreferido,
            req.observaciones,
          ].filter(Boolean).join(" | "),
          estado: mapRequestStatus(req.estado),
          createdAt: req.fechaCreacion || new Date(),
          updatedAt: req.fechaCreacion || new Date(),
        },
      },
      { upsert: true }
    );
  }
}

async function migrateLegacyMessages(db, legacyConversations) {
  for (const conversation of legacyConversations) {
    for (const msg of conversation.mensajes || []) {
      const remitente = msg.remitenteId;
      const destinatario =
        String(remitente) === String(conversation.clienteId)
          ? conversation.vendedorId
          : conversation.clienteId;

      await db.collection("messages").updateOne(
        { _id: msg._id },
        {
          $set: {
            remitente,
            destinatario,
            texto: msg.texto || "",
            leido: true,
            createdAt: msg.fechaEnvio || new Date(),
            updatedAt: msg.fechaEnvio || new Date(),
          },
        },
        { upsert: true }
      );
    }
  }
}

async function dropDuplicateCollections(db) {
  const duplicates = ["usuarios", "solicitudvehiculos", "conversacions", "notificacions"];
  for (const name of duplicates) {
    await db.collection(name).drop().catch(() => null);
  }
}

function runSeedDemo() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [path.join(__dirname, "seed-demo.js")],
      {
        cwd: path.join(__dirname, "..", ".."),
        stdio: "inherit",
        env: { ...process.env, DISABLE_EMAIL: "1" },
      }
    );

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`seed-demo exited with code ${code}`));
    });
  });
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  const legacy = await readLegacyState(db);
  await clearCurrentState(db);
  await migrateLegacyUsers(db, legacy.usuarios);
  await migrateLegacyClients(legacy.usuarios, legacy.solicitudvehiculos);
  await migrateLegacyRequests(db, legacy.solicitudvehiculos);
  await migrateLegacyMessages(db, legacy.conversacions);
  await dropDuplicateCollections(db);
  await mongoose.disconnect();

  await runSeedDemo();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
