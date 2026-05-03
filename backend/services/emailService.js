const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

/**
 * Enviar correo electrónico
 * @param {string} to - Destinatario
 * @param {string} subject - Asunto
 * @param {string} text - Contenido en texto plano
 * @param {string} html - Contenido en HTML
 * @param {Array} attachments - Archivos adjuntos (opcional)
 */
const sendEmail = async (to, subject, text, html, attachments = []) => {
  try {
    const info = await transporter.sendMail({
      from: `"BAEMIMPORT" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments
    });
    console.log('Email enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
