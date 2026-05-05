/**
 * Express app factory (no side effects like listening or DB connections).
 * Keeping this separate from server.js makes the backend testable and easier
 * to deploy (server.js becomes the runtime entrypoint).
 */

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

  app.use("/api/vehicles", require("./routes/vehicles"));
  app.use("/api/clients", require("./routes/clients"));
  app.use("/api/orders", require("./routes/orders"));
  app.use("/api/stats", require("./routes/stats"));

  app.use("/api/quotes", require("./routes/quotes"));
  app.use("/api/invoices", require("./routes/invoices"));

  app.use("/api/expenses", require("./routes/expenses"));
  app.use("/api/tasks", require("./routes/tasks"));
  app.use("/api/notifications", require("./routes/notifications"));

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

  // Serve frontend build (production)
  const frontendBuildDir = path.join(__dirname, "..", "frontend", "build");
  if (fs.existsSync(frontendBuildDir)) {
    app.use(express.static(frontendBuildDir));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
        return res.status(404).json({ error: "Not found" });
      }
      res.sendFile(path.join(frontendBuildDir, "index.html"));
    });
  }

  return app;
}

module.exports = { createApp };

