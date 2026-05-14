
const request = require("supertest");
const mongoose = require("mongoose");
const { createApp } = require("../app");

const User = require("../models/Usuario");
const Client = require("../models/Cliente");
const Vehicle = require("../models/Vehiculo");
const Order = require("../models/Pedido");
const Task = require("../models/Tarea");
const Notification = require("../models/Notificacion");

const { TEST_DB, dropAllCollections } = require("./_setup");

describe("Orders (business rules)", () => {
  const app = createApp();

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
    // Avoid sending real emails during tests
    process.env.DISABLE_EMAIL = "1";
    await mongoose.connect(TEST_DB);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await dropAllCollections();
  });

  async function login(email, password) {
    const res = await request(app).post("/api/auth/login").send({ email, password }).expect(200);
    return res.body.token;
  }

  test("creating an order generates standard tasks", async () => {
    const vendedor = new User({
      nombre: "Vendedor",
      email: "vendedor@test.com",
      password: "pass123",
      rol: "vendedor",
    });
    await vendedor.save();

    const clienteUser = new User({
      nombre: "Cliente",
      email: "cliente@test.com",
      password: "pass123",
      rol: "cliente",
    });
    await clienteUser.save();

    const clientDoc = await Client.create({
      usuario: clienteUser._id,
      vendedorAsignado: vendedor._id,
      nombre: "Cliente",
      apellidos: "Test",
      email: "cliente@test.com",
      telefono: "600000000",
    });

    const vehicleDoc = await Vehicle.create({
      marca: "BMW",
      modelo: "Serie 1",
      anio: 2020,
      combustible: "Diesel",
      transmision: "Automatico",
      precio: 20000,
      estado: "disponible",
      vin: "VIN-TEST-0001",
      creadoPor: vendedor._id,
    });

    const token = await login("vendedor@test.com", "pass123");

    await request(app)
      .post("/api/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        cliente: clientDoc._id,
        vehiculo: vehicleDoc._id,
        precioFinal: 21000,
        senial: 1000,
        metodoPago: "Transferencia bancaria",
        estado: "confirmado",
      })
      .expect(201);

    const tasks = await Task.find({}).lean();
    expect(tasks.length).toBe(3);

    const titles = tasks.map((t) => t.titulo).sort();
    expect(titles).toEqual(
      [
        "Gestionar transporte internacional",
        "Revisar pago de senial",
        "Verificar documentacion origen (Alemania)",
      ].sort()
    );
  });

  test("changing order phase creates a notification for the client user", async () => {
    const vendedor = new User({
      nombre: "Vendedor",
      email: "vendedor2@test.com",
      password: "pass123",
      rol: "vendedor",
    });
    await vendedor.save();

    const clienteUser = new User({
      nombre: "Cliente",
      email: "cliente2@test.com",
      password: "pass123",
      rol: "cliente",
    });
    await clienteUser.save();

    const clientDoc = await Client.create({
      usuario: clienteUser._id,
      vendedorAsignado: vendedor._id,
      nombre: "Cliente",
      apellidos: "Test",
      email: "cliente2@test.com",
      telefono: "600000000",
    });

    const vehicleDoc = await Vehicle.create({
      marca: "Audi",
      modelo: "A3",
      anio: 2019,
      combustible: "Gasolina",
      transmision: "Manual",
      precio: 15000,
      estado: "disponible",
      vin: "VIN-TEST-0002",
      creadoPor: vendedor._id,
    });

    const order = await Order.create({
      cliente: clientDoc._id,
      vehiculo: vehicleDoc._id,
      precioFinal: 16000,
      senial: 0,
      restante: 16000,
      estado: "en_gestion",
      fase: "alemania",
      creadoPor: vendedor._id,
    });

    const token = await login("vendedor2@test.com", "pass123");

    await request(app)
      .put(`/api/orders/${order._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ fase: "espana" })
      .expect(200);

    const notifs = await Notification.find({ destinatario: clienteUser._id }).lean();
    expect(notifs.length).toBe(1);
    expect(notifs[0].titulo).toMatch(/Actualizacion/i);
  });
});
