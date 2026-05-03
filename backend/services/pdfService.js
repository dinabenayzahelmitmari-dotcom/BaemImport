const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generar PDF de Factura o Presupuesto
 * @param {Object} data - Datos del documento (cliente, vehiculo, items, total, etc.)
 * @param {string} type - 'FACTURA' o 'PRESUPUESTO'
 * @returns {Promise<Buffer>}
 */
const generateDocumentPDF = async (data, type = 'FACTURA') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Logo
      const logoPath = path.join(__dirname, '../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 150 });
      } else {
        doc.fontSize(25).text('BAEMIMPORT', 50, 45);
      }

      // Header Info
      doc
        .fillColor('#444444')
        .fontSize(20)
        .text(type, 210, 50, { align: 'right' })
        .fontSize(10)
        .text(`Número: ${data.numero || 'S/N'}`, 210, 80, { align: 'right' })
        .text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 210, 95, { align: 'right' })
        .moveDown();

      // Divider
      doc.moveTo(50, 150).lineTo(550, 150).stroke('#EEEEEE');

      // Client Info
      doc
        .fontSize(12)
        .fillColor('#0d1b2e')
        .text('CLIENTE:', 50, 170)
        .fontSize(10)
        .fillColor('#444444')
        .text(data.cliente?.nombre || 'Cliente Final', 50, 185)
        .text(data.cliente?.email || '', 50, 198)
        .text(data.cliente?.telefono || '', 50, 211);

      // Vehicle Info
      doc
        .fontSize(12)
        .fillColor('#0d1b2e')
        .text('VEHÍCULO:', 300, 170)
        .fontSize(10)
        .fillColor('#444444')
        .text(`${data.vehiculo?.marca || ''} ${data.vehiculo?.modelo || ''}`, 300, 185)
        .text(`Bastidor: ${data.vehiculo?.bastidor || 'N/A'}`, 300, 198)
        .text(`Año: ${data.vehiculo?.anio || ''}`, 300, 211);

      // Table Header
      const tableTop = 260;
      doc
        .fontSize(10)
        .fillColor('#0d1b2e')
        .text('Descripción', 50, tableTop)
        .text('Cantidad', 280, tableTop, { width: 90, align: 'right' })
        .text('Precio Unit.', 370, tableTop, { width: 90, align: 'right' })
        .text('Total', 460, tableTop, { width: 90, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#EEEEEE');

      // Table Row (Single item for simplicity in this demo)
      const rowTop = tableTop + 30;
      doc
        .fontSize(10)
        .fillColor('#444444')
        .text(`${data.vehiculo?.marca} ${data.vehiculo?.modelo} - Importación`, 50, rowTop)
        .text('1', 280, rowTop, { width: 90, align: 'right' })
        .text(`${data.precio?.toLocaleString()} €`, 370, rowTop, { width: 90, align: 'right' })
        .text(`${data.precio?.toLocaleString()} €`, 460, rowTop, { width: 90, align: 'right' });

      // Totals
      const subtotalTop = rowTop + 60;
      doc
        .fontSize(10)
        .fillColor('#0d1b2e')
        .text('Subtotal:', 370, subtotalTop, { width: 90, align: 'right' })
        .text(`${data.precio?.toLocaleString()} €`, 460, subtotalTop, { width: 90, align: 'right' })
        
        .text('IVA (21%):', 370, subtotalTop + 15, { width: 90, align: 'right' })
        .text(`${(data.precio * 0.21).toLocaleString()} €`, 460, subtotalTop + 15, { width: 90, align: 'right' })
        
        .fontSize(14)
        .fillColor('#c8102e')
        .text('TOTAL:', 370, subtotalTop + 40, { width: 90, align: 'right' })
        .text(`${(data.precio * 1.21).toLocaleString()} €`, 460, subtotalTop + 40, { width: 90, align: 'right' });

      // Footer
      doc
        .fontSize(8)
        .fillColor('#AAAAAA')
        .text('Gracias por confiar en BAEMIMPORT. Para cualquier consulta, contacte con baemimport@gmail.com', 50, 700, { align: 'center', width: 500 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateDocumentPDF };
