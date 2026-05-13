
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

async function sendMail(options) {
  // For tests/CI: avoid sending real emails and avoid noisy errors when MAIL_* is not set.
  if (String(process.env.DISABLE_EMAIL || "0") === "1") return { disabled: true };
  return transporter.sendMail(options);
}

const EMPRESA = {
  nombre: "BAEMIMPORT",
  email: process.env.MAIL_USER,
  web: "www.baemimport.com",
  telefono: "+34 900 000 000",
  direccion: "Calle Ejemplo 1, Madrid, España",
};

function htmlBase(contenido, asunto) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${asunto}</title>
<style>
  body { margin:0; padding:0; background:#f0f2f5; font-family:'Helvetica Neue',Arial,sans-serif; }
  .wrapper { max-width:600px; margin:0 auto; }
  .header { background:#0d1b2e; padding:28px 32px; text-align:center; }
  .logo-diamond { display:inline-block; width:44px; height:44px; background:#c8102e; transform:rotate(45deg); border-radius:4px; }
  .brand { color:#ffffff; font-size:28px; font-weight:800; letter-spacing:4px; margin-top:12px; display:block; }
  .tagline { color:#8a94a0; font-size:11px; letter-spacing:2px; margin-top:4px; display:block; }
  .content { background:#ffffff; padding:32px; }
  .red-bar { height:3px; background:#c8102e; width:40px; margin:0 0 24px 0; }
  h2 { color:#0d1b2e; font-size:22px; font-weight:700; margin:0 0 8px 0; }
  p { color:#495057; font-size:15px; line-height:1.6; margin:0 0 16px 0; }
  .detail-box { background:#f8f9fa; border-left:3px solid #c8102e; padding:16px 20px; border-radius:0 8px 8px 0; margin:20px 0; }
  .detail-row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #e2e6ea; font-size:14px; }
  .detail-row:last-child { border-bottom:none; font-weight:700; color:#0d1b2e; }
  .detail-label { color:#8a94a0; }
  .detail-value { color:#0d1b2e; font-weight:600; }
  .btn-cta { display:inline-block; background:#c8102e; color:#ffffff; padding:14px 28px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px; margin:20px 0; }
  .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; }
  .badge-success { background:#e8f5e9; color:#2e7d32; }
  .badge-warning { background:#fff8e1; color:#f57f17; }
  .badge-info { background:#e3f2fd; color:#1565c0; }
  .footer { background:#0d1b2e; padding:20px 32px; text-align:center; }
  .footer p { color:#8a94a0; font-size:12px; margin:4px 0; }
  .footer a { color:#c8102e; text-decoration:none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <span class="brand">BAEMIMPORT</span>
    <span class="tagline">IMPORTACIÓN DE VEHÍCULOS · ALEMANIA — ESPAÑA</span>
  </div>
  <div class="content">
    ${contenido}
  </div>
  <div class="footer">
    <p>${EMPRESA.nombre} · ${EMPRESA.direccion}</p>
    <p>Tel: ${EMPRESA.telefono} · <a href="mailto:${EMPRESA.email}">${EMPRESA.email}</a></p>
    <p style="margin-top:8px; color:#495057; font-size:11px;">Este correo ha sido enviado de forma automática por el sistema de gestión BAEMIMPORT.</p>
  </div>
</div>
</body>
</html>`;
}

const emailService = {
  // Bienvenida a nuevo cliente
  async bienvenidaCliente(cliente) {
    const contenido = `
      <div class="red-bar"></div>
      <h2>Bienvenido a BAEMIMPORT, ${cliente.nombre}</h2>
      <p>Gracias por confiar en nosotros. Somos especialistas en importación de vehículos desde Alemania con más de 10 años de experiencia.</p>
      <p>Su expediente ha quedado registrado en nuestro sistema. Nuestro equipo se pondrá en contacto con usted a la mayor brevedad para asesorarle personalmente.</p>
      <div class="detail-box">
        <p style="margin:0; font-weight:700; color:#0d1b2e; margin-bottom:8px;">Sus datos de contacto registrados:</p>
        <div class="detail-row"><span class="detail-label">Nombre</span><span class="detail-value">${cliente.nombre} ${cliente.apellidos || ""}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${cliente.email}</span></div>
        <div class="detail-row"><span class="detail-label">Teléfono</span><span class="detail-value">${cliente.telefono || "No indicado"}</span></div>
      </div>
      <p>Si tiene alguna consulta, no dude en contactarnos.</p>`;
    
    try {
      await sendMail({
        from: `"BAEMIMPORT" <${EMPRESA.email}>`,
        to: cliente.email,
        subject: `Bienvenido a BAEMIMPORT, ${cliente.nombre}`,
        html: htmlBase(contenido, "Bienvenido a BAEMIMPORT"),
      });
    } catch (e) { console.error("Email bienvenida:", e.message); }
  },

  // Confirmacion de pedido al cliente
  async confirmacionPedido(pedido, cliente, vehiculo) {
    if (!cliente.email) return;
    const contenido = `
      <div class="red-bar"></div>
      <h2>Pedido confirmado</h2>
      <p>Estimado ${cliente.nombre}, su pedido ha sido confirmado correctamente. A continuacion encontrara el resumen:</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Vehiculo</span><span class="detail-value">${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}</span></div>
        <div class="detail-row"><span class="detail-label">Referencia pedido</span><span class="detail-value">${pedido._id?.toString().slice(-8).toUpperCase()}</span></div>
        <div class="detail-row"><span class="detail-label">Sena entregada</span><span class="detail-value">${pedido.senial?.toLocaleString("es-ES")} EUR</span></div>
        <div class="detail-row"><span class="detail-label">Importe pendiente</span><span class="detail-value">${pedido.restante?.toLocaleString("es-ES")} EUR</span></div>
        <div class="detail-row"><span class="detail-label">Precio total</span><span class="detail-value">${pedido.precioFinal?.toLocaleString("es-ES")} EUR</span></div>
      </div>
      <p>Nos pondremos en contacto con usted para informarle sobre el estado de su vehiculo.</p>`;
    
    try {
      await sendMail({
        from: `"BAEMIMPORT" <${EMPRESA.email}>`,
        to: cliente.email,
        subject: `Pedido confirmado - ${vehiculo.marca} ${vehiculo.modelo}`,
        html: htmlBase(contenido, "Pedido confirmado"),
      });
    } catch (e) { console.error("Email confirmacion pedido:", e.message); }
  },

  // Presupuesto enviado al cliente
  async presupuestoCliente(presupuesto, cliente, vehiculoDesc) {
    if (!cliente.email) return;
    const contenido = `
      <div class="red-bar"></div>
      <h2>Presupuesto ${presupuesto.numero}</h2>
      <p>Estimado ${cliente.nombre}, adjuntamos el presupuesto solicitado para su vehiculo de interes:</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Vehiculo</span><span class="detail-value">${vehiculoDesc}</span></div>
        <div class="detail-row"><span class="detail-label">Precio base</span><span class="detail-value">${presupuesto.precioBase?.toLocaleString("es-ES")} EUR</span></div>
        ${presupuesto.descuento ? `<div class="detail-row"><span class="detail-label">Descuento</span><span class="detail-value">-${presupuesto.descuento?.toLocaleString("es-ES")} EUR</span></div>` : ""}
        <div class="detail-row"><span class="detail-label">Gastos incluidos</span><span class="detail-value">${((presupuesto.gastosTransporte || 0) + (presupuesto.gastosGestion || 0) + (presupuesto.gastosMatriculacion || 0)).toLocaleString("es-ES")} EUR</span></div>
        <div class="detail-row"><span class="detail-label">PRECIO FINAL</span><span class="detail-value">${presupuesto.precioFinal?.toLocaleString("es-ES")} EUR</span></div>
      </div>
      <p>Este presupuesto tiene una validez de <strong>${presupuesto.validezDias} dias</strong> desde su emision.</p>
      <p>${presupuesto.condiciones || ""}</p>`;
    
    try {
      await sendMail({
        from: `"BAEMIMPORT" <${EMPRESA.email}>`,
        to: cliente.email,
        subject: `Presupuesto ${presupuesto.numero} - BAEMIMPORT`,
        html: htmlBase(contenido, `Presupuesto ${presupuesto.numero}`),
      });
    } catch (e) { console.error("Email presupuesto:", e.message); }
  },

  // Vehiculo listo para entrega
  async vehiculoListo(cliente, vehiculo) {
    if (!cliente.email) return;
    const contenido = `
      <div class="red-bar"></div>
      <h2>Su vehículo está listo para entrega</h2>
      <p>Estimado ${cliente.nombre}, nos complace informarle de que su vehículo ha completado todos los trámites y está listo para ser entregado:</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Vehículo</span><span class="detail-value">${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}</span></div>
        <div class="detail-row"><span class="detail-label">Color</span><span class="detail-value">${vehiculo.color || "No especificado"}</span></div>
        <div class="detail-row"><span class="detail-label">Estado</span><span class="detail-value"><span class="badge badge-success">Listo para entrega</span></span></div>
      </div>
      <p>Contáctenos para coordinar la fecha y el lugar de entrega que mejor le convenga.</p>`;
    
    try {
      await sendMail({
        from: `"BAEMIMPORT" <${EMPRESA.email}>`,
        to: cliente.email,
        subject: `Su vehículo ${vehiculo.marca} ${vehiculo.modelo} está listo`,
        html: htmlBase(contenido, "Vehículo listo para entrega"),
      });
    } catch (e) { console.error("Email vehiculo listo:", e.message); }
  },

  // Factura emitida
  async facturaEmitida(factura, cliente) {
    if (!cliente.email) return;
    const contenido = `
      <div class="red-bar"></div>
      <h2>Factura ${factura.numero}</h2>
      <p>Estimado ${cliente.nombre}, le adjuntamos la factura correspondiente a su operación con BAEMIMPORT:</p>
      <div class="detail-box">
        <div class="detail-row"><span class="detail-label">Número de factura</span><span class="detail-value">${factura.numero}</span></div>
        <div class="detail-row"><span class="detail-label">Subtotal</span><span class="detail-value">${factura.subtotal?.toLocaleString("es-ES")} EUR</span></div>
        <div class="detail-row"><span class="detail-label">IVA (21%)</span><span class="detail-value">${factura.totalIva?.toLocaleString("es-ES")} EUR</span></div>
        <div class="detail-row"><span class="detail-label">TOTAL</span><span class="detail-value">${factura.total?.toLocaleString("es-ES")} EUR</span></div>
        <div class="detail-row"><span class="detail-label">Método de pago</span><span class="detail-value">${factura.metodoPago}</span></div>
      </div>
      <p>Para cualquier consulta sobre esta factura, contacte con nosotros indicando el número de referencia.</p>`;
    
    try {
      await sendMail({
        from: `"BAEMIMPORT" <${EMPRESA.email}>`,
        to: cliente.email,
        subject: `Factura ${factura.numero} - BAEMIMPORT`,
        html: htmlBase(contenido, `Factura ${factura.numero}`),
      });
    } catch (e) { console.error("Email factura:", e.message); }
  },

  // Notificacion interna al equipo
  async notificacionInterna(asunto, cuerpo, destinatarios) {
    try {
      await sendMail({
        from: `"BAEMIMPORT Sistema" <${EMPRESA.email}>`,
        to: Array.isArray(destinatarios) ? destinatarios.join(", ") : destinatarios,
        subject: `[BAEMIMPORT] ${asunto}`,
        html: htmlBase(`<div class="red-bar"></div><h2>${asunto}</h2><p>${cuerpo}</p>`, asunto),
      });
    } catch (e) { console.error("Email interno:", e.message); }
  },

  // Email de contacto / seguimiento
  async emailSeguimiento(cliente, asunto, mensaje) {
    if (!cliente.email) return;
    const contenido = `
      <div class="red-bar"></div>
      <h2>${asunto}</h2>
      <p>Estimado ${cliente.nombre},</p>
      <p>${mensaje}</p>`;
    
    try {
      await sendMail({
        from: `"BAEMIMPORT" <${EMPRESA.email}>`,
        to: cliente.email,
        subject: asunto,
        html: htmlBase(contenido, asunto),
      });
    } catch (e) { console.error("Email seguimiento:", e.message); }
  },
};

// Envío de email genérico (API usada por el resto del backend).
// Mantenerlo aquí evita duplicar lógica en servicios paralelos.
async function sendEmail(to, subject, text, html, attachments = []) {
  if (String(process.env.DISABLE_EMAIL || "0") === "1") {
    // Useful for tests / CI: avoid sending real emails.
    return { disabled: true };
  }
  const safeSubject = subject || "BAEMIMPORT";
  const safeText = text || "";
  const safeHtml = html || htmlBase(`<div class="red-bar"></div><p>${safeText}</p>`, safeSubject);

  const info = await sendMail({
    from: `"${EMPRESA.nombre}" <${EMPRESA.email}>`,
    to,
    subject: safeSubject,
    text: safeText,
    html: safeHtml,
    attachments,
  });

  console.log("Email enviado: %s", info.messageId);
  return info;
}

module.exports = { ...emailService, sendEmail };
