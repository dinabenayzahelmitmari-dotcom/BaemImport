const request = require("supertest");
const mongoose = require("mongoose");
const { createApp } = require("../app");
const User = require("../models/Usuario");
const { TEST_DB, dropAllCollections } = require("./_setup");

describe("Auth", () => {
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

  test("register + login works", async () => {
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
    const u = new User({ nombre: "X", email: "x@example.com", password: "pass123", rol: "cliente", activo: false });
    await u.save();

    await request(app)
      .post("/api/auth/login")
      .send({ email: "x@example.com", password: "pass123" })
      .expect(403);
  });
});

