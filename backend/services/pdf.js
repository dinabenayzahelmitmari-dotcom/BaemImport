const PDFDocument = require("pdfkit");

const EMPRESA = {
  nombre: "BAEMIMPORT S.L.",
  cif: "B-XXXXXXXX",
  direccion: "Calle Ejemplo 1, 28001 Madrid, España",
  telefono: "+34 900 000 000",
  email: process.env.MAIL_USER || "baemimport@gmail.com",
  web: "www.baemimport.com",
  iban: "ES00 0000 0000 0000 0000 0000",
};

const NAVY = "#0d1b2e";
const RED = "#c8102e";
const GREY = "#8a94a0";
const LIGHT = "#f0f2f5";

function drawHeader(doc) {
  // Fondo cabecera
  doc.rect(0, 0, doc.page.width, 100).fill(NAVY);
  // Diamante logo
  doc.save();
  doc.translate(50, 50).rotate(45).rect(-16, -16, 32, 32).fill(RED).restore();
  // Nombre empresa
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text("BAEMIMPORT", 80, 28);
  doc.fillColor(GREY).font("Helvetica").fontSize(9).text("IMPORTACIÓN DE VEHÍCULOS · ALEMANIA — ESPAÑA", 80, 55);
  // Datos empresa derecha
  doc.fillColor(GREY).font("Helvetica").fontSize(8)
    .text(EMPRESA.email, 350, 28, { align: "right", width: 200 })
    .text(EMPRESA.telefono, 350, 42, { align: "right", width: 200 })
    .text(EMPRESA.web, 350, 56, { align: "right", width: 200 });
  doc.moveDown();
}

function drawFooter(doc, pageNum) {
  const y = doc.page.height - 50;
  doc.rect(0, y, doc.page.width, 50).fill(NAVY);
  doc.fillColor(GREY).font("Helvetica").fontSize(8)
    .text(`${EMPRESA.nombre} · CIF: ${EMPRESA.cif} · ${EMPRESA.direccion}`, 30, y + 12, { align: "center", width: doc.page.width - 60 })
    .text(`Tel: ${EMPRESA.telefono} · ${EMPRESA.email}`, 30, y + 26, { align: "center", width: doc.page.width - 60 });
  doc.fillColor(GREY).text(`Página ${pageNum}`, doc.page.width - 80, y + 18, { width: 60, align: "right" });
}

function sectionTitle(doc, texto, y) {
  doc.rect(30, y, 3, 16).fill(RED);
  doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(12).text(texto, 40, y + 2);
  return y + 28;
}

function tableRow(doc, cols, y, isHeader = false, isLast = false) {
  const rowH = 22;
  if (isHeader) {
    doc.rect(30, y, doc.page.width - 60, rowH).fill(NAVY);
    cols.forEach((col) => {
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
        .text(col.text, col.x, y + 7, { width: col.w, align: col.align || "left" });
    });
  } else {
    if (!isLast) {
      doc.rect(30, y, doc.page.width - 60, rowH).strokeColor(LIGHT).lineWidth(1).stroke();
    }
    cols.forEach((col) => {
      doc.fillColor(col.bold ? NAVY : "#495057").font(col.bold ? "Helvetica-Bold" : "Helvetica").fontSize(9)
        .text(col.text, col.x, y + 7, { width: col.w, align: col.align || "left" });
    });
  }
  return y + rowH;
}

const pdfService = {
  // Generar presupuesto PDF
  generarPresupuesto(presupuesto, cliente, vehiculoDesc) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      drawHeader(doc);

      let y = 120;

      // Titulo y numero
      doc.fillColor(RED).font("Helvetica-Bold").fontSize(18).text("PRESUPUESTO", 30, y);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(presupuesto.numero, 30, y + 24);
      
      // Badge estado
      const estadoColors = { borrador: "#8a94a0", enviado: "#1565c0", aceptado: "#2e7d32", rechazado: "#c8102e" };
      doc.roundedRect(400, y, 130, 20, 10).fill(estadoColors[presupuesto.estado] || GREY);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
        .text(presupuesto.estado.toUpperCase(), 410, y + 6, { width: 110, align: "center" });

      y += 60;

      // Datos cliente y empresa
      y = sectionTitle(doc, "DATOS DEL CLIENTE", y);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(`${cliente.nombre} ${cliente.apellidos || ""}`, 30, y);
      doc.fillColor(GREY).font("Helvetica").fontSize(9)
        .text(cliente.email || "", 30, y + 14)
        .text(cliente.telefono || "", 30, y + 26)
        .text(cliente.direccion || "", 30, y + 38);

      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(EMPRESA.nombre, 320, y);
      doc.fillColor(GREY).font("Helvetica").fontSize(9)
        .text(`CIF: ${EMPRESA.cif}`, 320, y + 14)
        .text(EMPRESA.direccion, 320, y + 26)
        .text(EMPRESA.telefono, 320, y + 38);

      y += 70;

      // Vehiculo
      y = sectionTitle(doc, "VEHICULO", y);
      doc.rect(30, y, doc.page.width - 60, 36).fill(LIGHT);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(11).text(vehiculoDesc, 40, y + 12, { width: doc.page.width - 80 });
      y += 50;

      // Tabla desglose
      y = sectionTitle(doc, "DESGLOSE ECONÓMICO", y);
      y = tableRow(doc, [
        { text: "CONCEPTO", x: 35, w: 300 },
        { text: "IMPORTE", x: 440, w: 100, align: "right" },
      ], y, true);

      const filas = [
        ["Precio base del vehículo", presupuesto.precioBase],
        presupuesto.descuento ? ["Descuento aplicado", -presupuesto.descuento] : null,
        presupuesto.gastosTransporte ? ["Gastos de transporte", presupuesto.gastosTransporte] : null,
        presupuesto.gastosGestion ? ["Gastos de gestion", presupuesto.gastosGestion] : null,
        presupuesto.gastosMatriculacion ? ["Gastos de matriculacion", presupuesto.gastosMatriculacion] : null,
        presupuesto.otrosGastos ? ["Otros gastos", presupuesto.otrosGastos] : null,
      ].filter(Boolean);

      filas.forEach((f, i) => {
        y = tableRow(doc, [
          { text: f[0], x: 35, w: 380 },
          { text: `${f[1].toLocaleString("es-ES", { minimumFractionDigits: 2 })} EUR`, x: 420, w: 120, align: "right", bold: i === filas.length - 1 },
        ], y, false, i === filas.length - 1);
      });

      // Total
      doc.rect(30, y, doc.page.width - 60, 28).fill(NAVY);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13)
        .text("PRECIO FINAL TOTAL", 35, y + 8)
        .text(`${presupuesto.precioFinal?.toLocaleString("es-ES", { minimumFractionDigits: 2 })} EUR`, 350, y + 8, { width: 170, align: "right" });
      y += 44;

      // Validez y condiciones
      doc.rect(30, y, doc.page.width - 60, 1).fill(LIGHT);
      y += 12;
      doc.fillColor(GREY).font("Helvetica").fontSize(9)
        .text(`Validez del presupuesto: ${presupuesto.validezDias} dias desde la fecha de emision.`, 30, y)
        .text(`Fecha de emision: ${new Date(presupuesto.createdAt || Date.now()).toLocaleDateString("es-ES")}`, 30, y + 14);
      
      if (presupuesto.condiciones) {
        y += 36;
        doc.fillColor(GREY).font("Helvetica").fontSize(8).text("Condiciones: " + presupuesto.condiciones, 30, y, { width: doc.page.width - 60 });
      }

      if (presupuesto.notas) {
        y += 32;
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text("Notas:", 30, y);
        doc.fillColor("#495057").font("Helvetica").fontSize(9).text(presupuesto.notas, 30, y + 14, { width: doc.page.width - 60 });
      }

      drawFooter(doc, 1);
      doc.end();
    });
  },

  // Generar factura PDF
  generarFactura(factura, cliente) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      drawHeader(doc);

      let y = 120;

      doc.fillColor(RED).font("Helvetica-Bold").fontSize(18).text("FACTURA", 30, y);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(14).text(factura.numero, 30, y + 24);
      doc.fillColor(GREY).font("Helvetica").fontSize(10)
        .text(`Fecha: ${new Date(factura.createdAt || Date.now()).toLocaleDateString("es-ES")}`, 30, y + 42);

      const estadoColors = { emitida: "#1565c0", pagada: "#2e7d32", vencida: "#c8102e", cancelada: "#8a94a0" };
      doc.roundedRect(400, y, 130, 20, 10).fill(estadoColors[factura.estado] || GREY);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
        .text(factura.estado.toUpperCase(), 410, y + 6, { width: 110, align: "center" });

      y += 70;

      y = sectionTitle(doc, "DATOS DEL CLIENTE", y);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(`${cliente.nombre} ${cliente.apellidos || ""}`, 30, y);
      doc.fillColor(GREY).font("Helvetica").fontSize(9)
        .text(cliente.dni ? `DNI/NIF: ${cliente.dni}` : "", 30, y + 14)
        .text(cliente.email || "", 30, y + 26)
        .text(cliente.telefono || "", 30, y + 38)
        .text(cliente.direccion || "", 30, y + 50);

      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10).text(EMPRESA.nombre, 320, y);
      doc.fillColor(GREY).font("Helvetica").fontSize(9)
        .text(`CIF: ${EMPRESA.cif}`, 320, y + 14)
        .text(EMPRESA.direccion, 320, y + 26)
        .text(EMPRESA.telefono, 320, y + 38)
        .text(`IBAN: ${EMPRESA.iban}`, 320, y + 50);

      y += 80;

      y = sectionTitle(doc, "LINEAS DE FACTURA", y);
      y = tableRow(doc, [
        { text: "DESCRIPCION", x: 35, w: 240 },
        { text: "CANT.", x: 280, w: 50, align: "center" },
        { text: "PRECIO UNIT.", x: 335, w: 90, align: "right" },
        { text: "IVA", x: 430, w: 40, align: "center" },
        { text: "TOTAL", x: 475, w: 80, align: "right" },
      ], y, true);

      factura.conceptos?.forEach((c, i) => {
        const total = c.cantidad * c.precioUnitario;
        y = tableRow(doc, [
          { text: c.descripcion, x: 35, w: 240 },
          { text: String(c.cantidad), x: 280, w: 50, align: "center" },
          { text: `${c.precioUnitario.toLocaleString("es-ES", { minimumFractionDigits: 2 })} EUR`, x: 335, w: 90, align: "right" },
          { text: `${c.iva}%`, x: 430, w: 40, align: "center" },
          { text: `${total.toLocaleString("es-ES", { minimumFractionDigits: 2 })} EUR`, x: 475, w: 80, align: "right" },
        ], y, false, i === factura.conceptos.length - 1);
      });

      y += 10;
      const rightX = doc.page.width - 200;
      doc.fillColor(GREY).font("Helvetica").fontSize(10)
        .text("Subtotal:", rightX, y).text(`${factura.subtotal?.toLocaleString("es-ES", { minimumFractionDigits: 2 })} EUR`, rightX + 80, y, { width: 90, align: "right" });
      y += 18;
      doc.fillColor(GREY).font("Helvetica").fontSize(10)
        .text("IVA (21%):", rightX, y).text(`${factura.totalIva?.toLocaleString("es-ES", { minimumFractionDigits: 2 })} EUR`, rightX + 80, y, { width: 90, align: "right" });
      y += 24;
      doc.rect(rightX - 10, y - 4, 200, 28).fill(NAVY);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13)
        .text("TOTAL:", rightX, y + 4).text(`${factura.total?.toLocaleString("es-ES", { minimumFractionDigits: 2 })} EUR`, rightX + 60, y + 4, { width: 110, align: "right" });

      y += 50;
      if (factura.metodoPago) {
        doc.fillColor(GREY).font("Helvetica").fontSize(9)
          .text(`Método de pago: ${factura.metodoPago}`, 30, y);
        if (factura.metodoPago === "Transferencia bancaria") {
          doc.text(`IBAN: ${EMPRESA.iban} · Beneficiario: ${EMPRESA.nombre}`, 30, y + 14);
        }
      }

      if (factura.notas) {
        y += 40;
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text("Notas:", 30, y);
        doc.fillColor("#495057").font("Helvetica").fontSize(9).text(factura.notas, 30, y + 14, { width: doc.page.width - 60 });
      }

      drawFooter(doc, 1);
      doc.end();
    });
  },

  // Ficha de vehiculo PDF
  generarFichaVehiculo(vehiculo, gastos) {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      drawHeader(doc);

      let y = 120;

      doc.fillColor(RED).font("Helvetica-Bold").fontSize(18).text("FICHA DE VEHÍCULO", 30, y);
      doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(20).text(`${vehiculo.marca} ${vehiculo.modelo}`, 30, y + 28);
      doc.fillColor(GREY).font("Helvetica").fontSize(12).text(`${vehiculo.anio} · ${vehiculo.combustible} · ${vehiculo.transmision}`, 30, y + 52);

      const estadoColors = { disponible: "#2e7d32", reservado: "#f57f17", vendido: "#c8102e", en_transito: "#1565c0" };
      doc.roundedRect(400, y, 130, 20, 10).fill(estadoColors[vehiculo.estado] || GREY);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
        .text(vehiculo.estado.toUpperCase().replace("_", " "), 410, y + 6, { width: 110, align: "center" });

      y += 90;

      y = sectionTitle(doc, "CARACTERÍSTICAS TÉCNICAS", y);
      const specs = [
        ["Marca", vehiculo.marca], ["Modelo", vehiculo.modelo], ["Año", vehiculo.anio],
        ["Combustible", vehiculo.combustible], ["Transmisión", vehiculo.transmision],
        ["Kilómetros", `${vehiculo.kilometros?.toLocaleString("es-ES")} km`],
        ["Color", vehiculo.color || "N/D"], ["VIN", vehiculo.vin || "N/D"],
        ["Ubicación", vehiculo.ubicacion],
      ];

      specs.forEach((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const cx = col === 0 ? 30 : 300;
        const cy = y + row * 22;
        doc.fillColor(GREY).font("Helvetica").fontSize(9).text(s[0] + ":", cx, cy, { width: 100 });
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text(String(s[1]), cx + 105, cy, { width: 150 });
      });

      y += Math.ceil(specs.length / 2) * 22 + 24;

      y = sectionTitle(doc, "DATOS ECONÓMICOS", y);
      const econ = [
        ["Precio de venta", `${vehiculo.precio?.toLocaleString("es-ES")} EUR`],
        ["Precio de compra", vehiculo.precioCompra ? `${vehiculo.precioCompra.toLocaleString("es-ES")} EUR` : "N/D"],
        ["Margen estimado", vehiculo.margen ? `${vehiculo.margen.toLocaleString("es-ES")} EUR` : "N/D"],
      ];

      econ.forEach((e) => {
        doc.rect(30, y, doc.page.width - 60, 22).strokeColor(LIGHT).lineWidth(1).stroke();
        doc.fillColor(GREY).font("Helvetica").fontSize(9).text(e[0], 35, y + 7, { width: 200 });
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(9).text(e[1], 240, y + 7, { width: 300, align: "right" });
        y += 22;
      });

      if (gastos && gastos.length > 0) {
        y += 16;
        y = sectionTitle(doc, "GASTOS ASOCIADOS", y);
        y = tableRow(doc, [
          { text: "CONCEPTO", x: 35, w: 250 },
          { text: "FECHA", x: 290, w: 90 },
          { text: "IMPORTE", x: 385, w: 80, align: "right" },
          { text: "ESTADO", x: 470, w: 80, align: "center" },
        ], y, true);

        gastos.forEach((g, i) => {
          y = tableRow(doc, [
            { text: g.concepto, x: 35, w: 250 },
            { text: new Date(g.fecha).toLocaleDateString("es-ES"), x: 290, w: 90 },
            { text: `${g.importe.toLocaleString("es-ES")} EUR`, x: 385, w: 80, align: "right" },
            { text: g.pagado ? "Pagado" : "Pendiente", x: 470, w: 80, align: "center", bold: g.pagado },
          ], y, false, i === gastos.length - 1);
        });

        y += 8;
        const totalGastos = gastos.reduce((s, g) => s + g.importe, 0);
        doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(10)
          .text(`Total gastos: ${totalGastos.toLocaleString("es-ES")} EUR`, 350, y, { width: 200, align: "right" });
      }

      if (vehiculo.descripcion) {
        y += 32;
        y = sectionTitle(doc, "DESCRIPCIÓN", y);
        doc.fillColor("#495057").font("Helvetica").fontSize(9).text(vehiculo.descripcion, 30, y, { width: doc.page.width - 60 });
      }

      drawFooter(doc, 1);
      doc.end();
    });
  },
};

module.exports = pdfService;
