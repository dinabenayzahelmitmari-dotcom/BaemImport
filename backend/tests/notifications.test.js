const request = require("supertest");
const mongoose = require("mongoose");
const { createApp } = require("../app");
const User = require("../models/Usuario");
const Notification = require("../models/Notificacion");
const { TEST_DB, dropAllCollections } = require("./_setup");

describe("Notifications", () => {
  const app = createApp();

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
    process.env.DISABLE_EMAIL = "1";
    await mongoose.connect(TEST_DB);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await dropAllCollections();
  });

  test("create notification persists and can be read by destinatario", async () => {
    const admin = new User({ nombre: "Admin", email: "admin@test.com", password: "pass123", rol: "admin" });
    const client = new User({ nombre: "Client", email: "client@test.com", password: "pass123", rol: "cliente" });
    await admin.save();
    await client.save();

    // Login as admin
    const login = await request(app).post("/api/auth/login").send({ email: "admin@test.com", password: "pass123" }).expect(200);
    const token = login.body.token;

    const created = await request(app)
      .post("/api/notifications")
      .set("Authorization", `Bearer ${token}`)
      .send({ destinatario: client._id, titulo: "Hola", mensaje: "Prueba", tipo: "info" })
      .expect(201);

    expect(created.body._id).toBeTruthy();
    expect(await Notification.countDocuments()).toBe(1);

    // Login as client and read list
    const loginClient = await request(app).post("/api/auth/login").send({ email: "client@test.com", password: "pass123" }).expect(200);
    const tokenClient = loginClient.body.token;

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", `Bearer ${tokenClient}`)
      .expect(200);

    expect(list.body.notifications.length).toBe(1);
    expect(list.body.noLeidas).toBe(1);
  });
});

