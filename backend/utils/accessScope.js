const mongoose = require("mongoose");
const Client = require("../models/Cliente");
const Order = require("../models/Pedido");

function isAdmin(user) {
  return user?.rol === "admin";
}

function isSeller(user) {
  return user?.rol === "vendedor" || user?.rol === "empleado";
}

function isClient(user) {
  return user?.rol === "cliente";
}

function toObjectId(value) {
  if (!value) return null;
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (mongoose.Types.ObjectId.isValid(value)) return new mongoose.Types.ObjectId(value);
  return null;
}

async function getAccessibleClientIds(user) {
  if (isAdmin(user)) return null;

  if (isSeller(user)) {
    const docs = await Client.find({ vendedorAsignado: user._id }).select("_id").lean();
    return docs.map((doc) => String(doc._id));
  }

  if (isClient(user)) {
    const client = await Client.findOne({ usuario: user._id }).select("_id").lean();
    return client ? [String(client._id)] : [];
  }

  return [];
}

async function applyClientScopeToFilter(user, filter, fieldName = "cliente") {
  const ids = await getAccessibleClientIds(user);
  if (ids === null) return filter;
  const objectIds = ids.map((id) => toObjectId(id)).filter(Boolean);
  filter[fieldName] = { $in: objectIds };
  return filter;
}

async function canAccessClient(user, clientId) {
  const ids = await getAccessibleClientIds(user);
  if (ids === null) return true;
  return ids.includes(String(clientId));
}

async function getAccessibleVehicleScope(user) {
  if (isAdmin(user)) return {};

  if (isSeller(user)) {
    const clientIds = await getAccessibleClientIds(user);
    const objectIds = clientIds.map((id) => toObjectId(id)).filter(Boolean);
    const orderedVehicleIds = objectIds.length
      ? await Order.distinct("vehiculo", { cliente: { $in: objectIds } })
      : [];
    return {
      $or: [
        { creadoPor: user._id },
        { _id: { $in: orderedVehicleIds } },
      ],
    };
  }

  if (isClient(user)) {
    const clientIds = await getAccessibleClientIds(user);
    const objectIds = clientIds.map((id) => toObjectId(id)).filter(Boolean);
    const orderedVehicleIds = objectIds.length
      ? await Order.distinct("vehiculo", { cliente: { $in: objectIds } })
      : [];
    return { _id: { $in: orderedVehicleIds } };
  }

  return { _id: { $in: [] } };
}

module.exports = {
  isAdmin,
  isSeller,
  isClient,
  toObjectId,
  getAccessibleClientIds,
  applyClientScopeToFilter,
  canAccessClient,
  getAccessibleVehicleScope,
};
