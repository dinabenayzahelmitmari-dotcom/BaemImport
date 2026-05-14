
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    marca: { type: String, required: true, trim: true },
    modelo: { type: String, required: true, trim: true },
    anio: { type: Number, required: true },
    combustible: { type: String, enum: ["Diesel", "Gasolina", "Hibrido", "Electrico", "GLP", "Otro"], default: "Diesel" },
    transmision: { type: String, enum: ["Automatico", "Manual"], default: "Automatico" },
    kilometros: { type: Number, default: 0 },
    color: { type: String },
    vin: { type: String },
    precio: { type: Number, required: true },
    precioCompra: { type: Number },
    margen: { type: Number },
    ubicacion: { type: String, enum: ["Alemania", "En transito", "Espana", "Pendiente de homologar", "Otro"], default: "Alemania" },
    estado: { type: String, enum: ["disponible", "reservado", "en_transito", "vendido"], default: "disponible" },
    descripcion: { type: String },
    extras: [{ type: String }],
    fotos: [{ type: String }],
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

vehicleSchema.index({ vin: 1 }, { unique: true, sparse: true });

vehicleSchema.pre("save", function (next) {
  if (this.precio && this.precioCompra) {
    this.margen = this.precio - this.precioCompra;
  }
  next();
});

// Mantener `margen` coherente tambien en updates por query (findOneAndUpdate, etc).
// Nota: los middlewares `pre("save")` no se ejecutan en `findOneAndUpdate`.
vehicleSchema.pre(["findOneAndUpdate", "updateOne"], async function (next) {
  try {
    const update = this.getUpdate() || {};
    const $set = update.$set || update;
    const touchesPrecio = Object.prototype.hasOwnProperty.call($set, "precio");
    const touchesCompra = Object.prototype.hasOwnProperty.call($set, "precioCompra");
    if (!touchesPrecio && !touchesCompra) return next();

    // Necesitamos ambos valores para recalcular el margen.
    // Si en el update viene solo uno, obtenemos el otro del documento actual.
    const current = await this.model.findOne(this.getQuery()).select("precio precioCompra").lean();
    const precio = touchesPrecio ? Number($set.precio) : Number(current?.precio);
    const precioCompra = touchesCompra ? Number($set.precioCompra) : Number(current?.precioCompra);

    if (Number.isFinite(precio) && Number.isFinite(precioCompra)) {
      const margen = precio - precioCompra;
      if (update.$set) update.$set.margen = margen;
      else update.margen = margen;
      this.setUpdate(update);
      return next();
    }

    // Si falta algun valor, eliminamos el margen para no dejar uno obsoleto.
    if (!update.$unset) update.$unset = {};
    update.$unset.margen = 1;
    this.setUpdate(update);
    next();
  } catch (e) {
    next(e);
  }
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
