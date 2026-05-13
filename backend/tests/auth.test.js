
const request = require("supertest");
const mongoose = require("mongoose");
const { createApp } = require("../app");
const User = require("../models/Usuario");
const { TEST_DB, dropAllCollections } = require("./_setup");

describe("Auth", () => {
  // App de Express en modo test (sin levantar servidor real).
  const app = createApp();

  beforeAll(async () => {
    // Configuracion minima para entorno de pruebas.
    process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
    process.env.DISABLE_EMAIL = "1";
    await mongoose.connect(TEST_DB);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Limpia colecciones para que cada test sea aislado.
    await dropAllCollections();
  });

  test("register + login works", async () => {
    // Flujo feliz: alta de usuario y posterior login.
    await request(app)
      .post("/api/auth/register")
      .send({ nombre: "Test", email: "test@example.com", password: "pass123" })
      .expect(201);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "pass123" })
      .expect(200);

    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("test@example.com");
  });

  test("disabled user cannot login", async () => {
    // Caso de negocio: un usuario desactivado no debe autenticarse.
    const u = new User({ nombre: "X", email: "x@example.com", password: "pass123", rol: "cliente", activo: false });
    await u.save();

    await request(app)
      .post("/api/auth/login")
      .send({ email: "x@example.com", password: "pass123" })
      .expect(403);
  });
});
