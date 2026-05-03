const { sendEmail } = require('../services/emailService');
const { generateDocumentPDF } = require('../services/pdfService');
const { processAiQuery } = require('../services/aiService');

const sendClientEmail = async (req, res) => {
  try {
    const { to, subject, message, attachments } = req.body;
    await sendEmail(to, subject, message, `<p>${message}</p>`, attachments);
    res.json({ success: true, message: 'Email enviado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el email' });
  }
};

const downloadPDF = async (req, res) => {
  try {
    const data = req.body; // In a real app, fetch from DB using ID
    const pdfBuffer = await generateDocumentPDF(data, data.type || 'PRESUPUESTO');
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${data.type || 'documento'}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
};

const askAI = async (req, res) => {
  try {
    const { query } = req.body;
    const response = await processAiQuery(query);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Error en el asistente de IA' });
  }
};

module.exports = { sendClientEmail, downloadPDF, askAI };
