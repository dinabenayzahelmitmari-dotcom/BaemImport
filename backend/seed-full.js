
require('dotenv').config();
const mongoose = require('mongoose');
const Vehicle = require('./models/Vehiculo');
const Client = require('./models/Cliente');
const Order = require('./models/Pedido');
const Task = require('./models/Tarea');
const Notification = require('./models/Notificacion');
const User = require('./models/Usuario');

const vehicles = [
  { marca: 'BMW', modelo: 'Series 3 M Sport', anio: 2021, kilometros: 45000, combustible: 'Diesel', transmision: 'Automatico', precio: 32500, estado: 'disponible', vin: 'WBA31AG000123456' },
  { marca: 'Audi', modelo: 'A4 Avant S-line', anio: 2020, kilometros: 62000, combustible: 'Gasolina', transmision: 'Automatico', precio: 29900, estado: 'vendido', vin: 'WAUZZZ8W12345678' },
  { marca: 'Mercedes-Benz', modelo: 'CLA 200 AMG', anio: 2022, kilometros: 15000, combustible: 'Hibrido', transmision: 'Automatico', precio: 38700, estado: 'reservado', vin: 'WDD1183121N123456' },
  { marca: 'Volkswagen', modelo: 'Golf GTI Performance', anio: 2019, kilometros: 78000, combustible: 'Gasolina', transmision: 'Manual', precio: 24500, estado: 'disponible', vin: 'WVWZZZAU12345678' }
];

const clients = [
  { nombre: 'Juan', apellidos: 'GarcÃ­a PÃ©rez', email: 'juan.garcia@gmail.com', telefono: '600123456', direccion: 'Calle Mayor 1, Madrid', dni: '12345678A' },
  { nombre: 'MarÃ­a', apellidos: 'RodrÃ­guez LÃ³pez', email: 'm.rodriguez@outlook.com', telefono: '611234567', direccion: 'Av. Libertad 45, Valencia', dni: '87654321B' }
];

async function seedFull() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB para simulaciÃ³n...');

    // Limpiar colecciones
    await Vehicle.deleteMany({});
    await Client.deleteMany({});
    await Order.deleteMany({});
    await Task.deleteMany({});
    await Notification.deleteMany({});

    // Insertar vehÃ­culos y clientes
    const vDocs = await Vehicle.insertMany(vehicles);
    const cDocs = await Client.insertMany(clients);
    console.log('VehÃ­culos y clientes insertados.');

    // Crear un pedido simulado
    await Order.create({
      vehiculo: vDocs[1]._id,
      cliente: cDocs[0]._id,
      estado: 'en_gestion',
      precioFinal: 31500,
      documentos: {
        alemania: [
          { nombre: 'Ficha TÃ©cnica (Teil I)', url: '#' },
          { nombre: 'Factura Compra Original', url: '#' }
        ],
        espania: [
          { nombre: 'Solicitud MatriculaciÃ³n', url: '#' }
        ]
      }
    });

    // Crear tareas
    await Task.insertMany([
      { titulo: 'RevisiÃ³n ITV BMW', descripcion: 'Llevar el BMW a la estaciÃ³n ITV de Getafe', estado: 'pendiente', prioridad: 'alta', fechaLimite: new Date(Date.now() + 86400000) },
      { titulo: 'Llamar a cliente MarÃ­a', descripcion: 'Confirmar recepciÃ³n de documentos del Mercedes', estado: 'completada', prioridad: 'normal' }
    ]);

    const admin = await User.findOne({ email: 'admin@baemimport.com' });

    // Crear notificaciones/alertas
    await Notification.create({
      destinatario: admin._id,
      titulo: 'Nuevo presupuesto solicitado',
      mensaje: 'El cliente Juan GarcÃ­a ha solicitado un presupuesto para el VW Golf GTI.',
      tipo: 'info',
      enlace: '/quotes'
    });

    console.log('SimulaciÃ³n completada con Ã©xito.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedFull();
