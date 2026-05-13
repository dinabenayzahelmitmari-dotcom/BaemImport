
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");

// Calculadora de importación Alemania -> España
// Endpoint: POST /calcular
router.post("/calcular", authMiddleware, (req, res) => {
  try {
    const {
      precioCompraEUR,      // Precio compra en Alemania (€)
      anio,                  // Año del vehículo
      _cilindrada,            // cc (no usado en este calculo)
      combustible,           // tipo combustible
      co2,                   // g/km CO2
      _kilometros,
      transporteAlemania,    // coste transporte hasta frontera/España
      gastosHomologacion,    // ITV, homologación
      gastosGestion,         // gestoría, documentación
    } = req.body;

    const precio = parseFloat(precioCompraEUR) || 0;
    const transport = parseFloat(transporteAlemania) || 0;
    const homol = parseFloat(gastosHomologacion) || 0;
    const gestion = parseFloat(gastosGestion) || 0;

    // IVA importación intracomunitaria (exento entre países UE para empresas con NIF intracomunitario)
    // Para particulares: IVA 21% sobre precio + transporte
    const baseImponibleIVA = precio + transport;
    const ivaImportacion = baseImponibleIVA * 0.21;

    // Impuesto de Matriculación (IEDMT) según CO2 - España 2024
    let impuestoMatriculacion = 0;
    const co2Val = parseFloat(co2) || 0;
    if (combustible === "Eléctrico") {
      impuestoMatriculacion = 0; // Exento
    } else if (co2Val <= 120) {
      impuestoMatriculacion = 0;
    } else if (co2Val <= 160) {
      impuestoMatriculacion = precio * 0.045;
    } else if (co2Val <= 200) {
      impuestoMatriculacion = precio * 0.09;
    } else {
      impuestoMatriculacion = precio * 0.145;
    }

    // Tasas de matriculación (DGT aprox.)
    const tasaMatriculacion = 99.37;

    // ITV y homologación estimada si no se proporciona
    const itvHomol = homol || (anio && new Date().getFullYear() - parseInt(anio) > 3 ? 150 : 80);

    // Gestoría y documentos si no se proporciona
    const gestoria = gestion || 250;

    // Seguro de transporte estimado
    const seguroTransporte = precio * 0.005;

    // Resumen
    const desglose = [
      { concepto: "Precio de compra (Alemania)", importe: precio },
      { concepto: "Transporte hasta España", importe: transport || 800 },
      { concepto: "IVA intracomunitario (21%)", importe: ivaImportacion, nota: "Recuperable si empresa con NIF intracomunitario" },
      { concepto: "Impuesto de Matriculación (IEDMT)", importe: impuestoMatriculacion },
      { concepto: "Tasas DGT / Matrícula", importe: tasaMatriculacion },
      { concepto: "ITV y Homologación", importe: itvHomol },
      { concepto: "Gestoría y Documentación", importe: gestoria },
      { concepto: "Seguro de transporte", importe: seguroTransporte },
    ];

    const totalGastos = desglose.slice(1).reduce((s, d) => s + d.importe, 0);
    const costeTotal = precio + totalGastos;

    res.json({
      desglose,
      totalGastos: Math.round(totalGastos * 100) / 100,
      costeTotal: Math.round(costeTotal * 100) / 100,
      precioCompra: precio,
      recomendacionPrecioVenta: {
        margen10: Math.round(costeTotal * 1.10),
        margen15: Math.round(costeTotal * 1.15),
        margen20: Math.round(costeTotal * 1.20),
        margen25: Math.round(costeTotal * 1.25),
      },
    });
  } catch (err) {
    res.status(400).json({ error: "Error en el cálculo: " + err.message });
  }
});

module.exports = router;
