 * Demo seed (idempotent-ish):
 * - Upserts the requested vendor + client users (with password hashing via model hook).
 * - Links Client.usuario -> User for client access control and notifications.
 * - Creates sample vehicles, one order, tasks, one vehicle request, one message, one notification.
 * - Sends one email from the company mailbox (if MAIL_* env vars are configured).

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

const User = require("../models/Usuario");
const Client = require("../models/Cliente");
const Vehicle = require("../models/Vehiculo");
const Order = require("../models/Pedido");
const Task = require("../models/Tarea");
const Notification = require("../models/Notificacion");
const VehicleRequest = require("../models/SolicitudVehiculo");
const Message = require("../models/Mensaje");
const { sendEmail } = require("../services/email");

async function upsertUser({ nombre, email, password, rol }) {
  const e = email.toLowerCase();
  let u = await User.findOne({ email: e });
  if (!u) {
    u = new User({ nombre, email: e, password, rol, activo: true });
  } else {
    u.nombre = nombre;
    u.rol = rol;
    u.activo = true;
    // Solo reescribir password si se pasa expresamente
    if (password) u.password = password;
  }
  await u.save(); // dispara hash del password
  return u;
}

async function upsertClientForUser({ user, nombre, apellidos, telefono, dni }) {
  const e = user.email.toLowerCase();
  let c = await Client.findOne({ usuario: user._id });
  if (!c) {
    c = new Client({
      usuario: user._id,
      nombre,
      apellidos,
      email: e,
      telefono,
      dni,
      origen: "otro",
    });
  } else {
    c.nombre = nombre;
    c.apellidos = apellidos;
    c.email = e;
    c.telefono = telefono;
    c.dni = dni;
    c.usuario = user._id;
  }
  await c.save();
  return c;
}

async function upsertVehicle(v) {
  // VIN es buen identificador (si existe)
  if (v.vin) {
    const existing = await Vehicle.findOne({ vin: v.vin });
    if (existing) {
      Object.assign(existing, v);
      await existing.save();
      return existing;
    }
  }
  return Vehicle.create(v);
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  // Usuarios
  const vendedor = await upsertUser({
    nombre: "Dina",
    email: "dinabenayzahelmitmari@gmail.com",
    password: "saradina",
    rol: "vendedor",
  });

  const clienteUser = await upsertUser({
    nombre: "Ahmed",
    email: "ahmedbenayzah48@gmail.com",
    password: "saradina",
    rol: "cliente",
  });

  // Cliente vinculado al user
  const cliente = await upsertClientForUser({
    user: clienteUser,
    nombre: "Ahmed",
    apellidos: "Benayzah",
    telefono: "600000000",
    dni: "X0000000X",
  });

  // Vehiculos demo
  const vehiculos = [
    {
      marca: "BMW",
      modelo: "Serie 3 M Sport",
      anio: 2021,
      kilometros: 45000,
      combustible: "Diesel",
      transmision: "Automatico",
      precio: 32500,
      estado: "disponible",
      vin: "WBA31AG000123456",
      ubicacion: "Alemania",
      creadoPor: vendedor._id,
    },
    {
      marca: "Audi",
      modelo: "A4 Avant S-line",
      anio: 2020,
      kilometros: 62000,
      combustible: "Gasolina",
      transmision: "Automatico",
      precio: 29900,
      estado: "reservado",
      vin: "WAUZZZ8W12345678",
      ubicacion: "En transito",
      creadoPor: vendedor._id,
    },
  ];
  const vDocs = [];
  for (const v of vehiculos) vDocs.push(await upsertVehicle(v));

  // Pedido demo (cliente -> vehiculo)
  let order = await Order.findOne({ cliente: cliente._id, vehiculo: vDocs[0]._id });
  if (!order) {
    order = await Order.create({
      cliente: cliente._id,
      vehiculo: vDocs[0]._id,
      precioFinal: 34000,
      senial: 1000,
      restante: 33000,
      estado: "en_gestion",
      metodoPago: "Transferencia bancaria",
      fase: "alemania",
      creadoPor: vendedor._id,
      notas: "Pedido demo generado automaticamente.",
    });
  }

  // Tareas demo
  const tareas = [
    { titulo: "Documentacion origen", categoria: "Documentacion", prioridad: "alta" },
    { titulo: "Coordinar transporte", categoria: "Importacion", prioridad: "normal" },
    { titulo: "Confirmar pago", categoria: "Financiero", prioridad: "urgente" },
  ];
  for (const t of tareas) {
    const exists = await Task.findOne({ pedido: order._id, titulo: t.titulo });
    if (!exists) {
      await Task.create({
        ...t,
        pedido: order._id,
        asignadoA: vendedor._id,
        creadoPor: vendedor._id,
        fechaLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      });
    }
  }

  // Solicitud de vehiculo demo (cliente)
  const reqExists = await VehicleRequest.findOne({ cliente: clienteUser._id, marca: "Mercedes-Benz", modelo: "CLA 200" });
  if (!reqExists) {
    await VehicleRequest.create({
      cliente: clienteUser._id,
      marca: "Mercedes-Benz",
      modelo: "CLA 200",
      anioDesde: 2020,
      presupuesto: 35000,
      combustible: "Hibrido",
      transmision: "Automatico",
      extras: "AMG line, cuero",
      estado: "pendiente",
    });
  }

  // Mensaje demo (vendedor <-> cliente)
  const msgExists = await Message.findOne({ remitente: vendedor._id, destinatario: clienteUser._id });
  if (!msgExists) {
    await Message.create({
      remitente: vendedor._id,
      destinatario: clienteUser._id,
      texto: "Hola Ahmed, ya tenemos varias opciones para tu importacion. Te mando el resumen en breve.",
      leido: false,
    });
  }

  // Notificacion demo + email
  const notifExists = await Notification.findOne({ destinatario: clienteUser._id, titulo: "Bienvenido" });
  if (!notifExists) {
    const notif = await Notification.create({
      destinatario: clienteUser._id,
      titulo: "Bienvenido",
      mensaje: "Tu panel ya esta listo. Puedes seguir el estado de tu pedido desde la seccion Pedidos.",
      tipo: "info",
      leido: false,
      enlace: "/orders",
    });

    // Enviar email desde la cuenta de empresa
    try {
      await sendEmail(
        clienteUser.email,
        `BAEMIMPORT - ${notif.titulo}`,
        notif.mensaje,
        `<p>${notif.mensaje}</p>`
      );
    } catch (_e) {}
  }

  console.log("Seed demo completado.");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
