
const { sendEmail } = require("../services/email");
const { generarPresupuesto, generarFactura } = require("../services/pdf");
const { processAiQuery } = require("../services/aiService");

const sendClientEmail = async (req, res) => {
  try {
    const { to, subject, message, attachments } = req.body;
    await sendEmail(to, subject, message, `<p>${message}</p>`, attachments);
    res.json({ success: true, message: 'Email enviado correctamente' });
  } catch (_error) {
    res.status(500).json({ error: "Error al enviar el email" });
  }
};

const downloadPDF = async (req, res) => {
  try {
    const data = req.body; // En un caso real, buscar por ID en BBDD
    const type = (data.type || "PRESUPUESTO").toUpperCase();

    let pdfBuffer;
    if (type === "FACTURA") pdfBuffer = await generarFactura(data, data.cliente || {});
    else pdfBuffer = await generarPresupuesto(data, data.cliente || {}, data.vehiculoDesc || "");
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${data.type || 'documento'}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (_error) {
    res.status(500).json({ error: "Error al generar el PDF" });
  }
};

const askAI = async (req, res) => {
  try {
    const { query } = req.body;
    const response = await processAiQuery(query);
    res.json({ response });
  } catch (_error) {
    res.status(500).json({ error: "Error en el asistente de IA" });
  }
};

module.exports = { sendClientEmail, downloadPDF, askAI };
