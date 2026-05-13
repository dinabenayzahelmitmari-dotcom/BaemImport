
const mongoose = require("mongoose");

const TEST_DB = process.env.MONGO_URI_TEST || "mongodb://127.0.0.1:27017/baemimport_test";

async function dropAllCollections() {
  const cols = await mongoose.connection.db.collections();
  for (const c of cols) {
    await c.deleteMany({});
  }
}

module.exports = { TEST_DB, dropAllCollections };

