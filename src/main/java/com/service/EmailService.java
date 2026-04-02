package com.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;

import jakarta.mail.internet.MimeMessage;

import java.io.InputStream;
import java.util.Properties;

/**
 * Servicio de envio de correos electronicos reales desde baemimport@gmail.com.
 */
public class EmailService {

    private final JavaMailSender mailSender;
    private final String correoRemitente;
    private String ultimoError = "";

    public EmailService() {
        Properties properties = cargarConfiguracionCorreo();
        correoRemitente = properties.getProperty("spring.mail.username", "baemimport@gmail.com");
        mailSender = crearMailSender(properties);
    }

    /**
     * Envia un correo de texto plano.
     * Devuelve true si se envio correctamente, false si hubo error.
     */
    public boolean enviarCorreoSimple(String destinatario, String asunto, String cuerpo) {
        try {
            ultimoError = "";
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setFrom(correoRemitente);
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            System.out.println("[EMAIL ENVIADO] Para: " + destinatario + " | Asunto: " + asunto);
            return true;
        } catch (Exception e) {
            ultimoError = e.getMessage() == null ? "Error desconocido al enviar correo." : e.getMessage();
            System.err.println("[EMAIL ERROR] " + e.getMessage());
            return false;
        }
    }

    /**
     * Envia un correo con cuerpo en formato HTML.
     * Devuelve true si se envio correctamente, false si hubo error.
     */
    public boolean enviarCorreoHtml(String destinatario, String asunto, String htmlCuerpo) {
        try {
            ultimoError = "";
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setFrom(correoRemitente);
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(htmlCuerpo, true);
            mailSender.send(mensaje);
            System.out.println("[EMAIL HTML ENVIADO] Para: " + destinatario + " | Asunto: " + asunto);
            return true;
        } catch (Exception e) {
            ultimoError = e.getMessage() == null ? "Error desconocido al enviar correo HTML." : e.getMessage();
            System.err.println("[EMAIL HTML ERROR] " + e.getMessage());
            return false;
        }
    }

    /**
     * Correo de bienvenida al registrarse un usuario nuevo.
     */
    public boolean enviarBienvenida(String destinatario, String nombre) {
        String asunto = "Bienvenido a BAEMIMPORT";
        String cuerpo = "Hola " + nombre + ",\n\n"
                + "Tu cuenta en BAEMIMPORT ha sido creada correctamente.\n"
                + "Ya puedes comenzar a gestionar tus importaciones de vehiculos desde Alemania.\n\n"
                + "Un saludo,\nEl equipo de BAEMIMPORT\n"
                + "baemimport@gmail.com";
        return enviarCorreoSimple(destinatario, asunto, cuerpo);
    }

    /**
     * Correo de notificacion cuando cambia el estado de una importacion.
     */
    public boolean enviarCambioEstado(String destinatario, String nombre,
                                      String vehiculo, String nuevoEstado) {
        String asunto = "Actualizacion de tu importacion - " + vehiculo;
        String cuerpo = "Hola " + nombre + ",\n\n"
                + "El estado de tu importacion ha cambiado:\n"
                + "Vehiculo: " + vehiculo + "\n"
                + "Nuevo estado: " + nuevoEstado + "\n\n"
                + "Accede a la aplicacion para ver mas detalles.\n\n"
                + "Un saludo,\nEl equipo de BAEMIMPORT\n"
                + "baemimport@gmail.com";
        return enviarCorreoSimple(destinatario, asunto, cuerpo);
    }

    /**
     * Correo de recordatorio cuando hay un documento pendiente de subir.
     */
    public boolean enviarRecordatorioDocumento(String destinatario, String nombre,
                                               String documento, String fase) {
        String asunto = "Documento pendiente: " + documento;
        String cuerpo = "Hola " + nombre + ",\n\n"
                + "Tienes un documento pendiente de subir:\n"
                + "Documento: " + documento + "\n"
                + "Fase: " + fase + "\n\n"
                + "Por favor, accede a la aplicacion y completa la documentacion.\n\n"
                + "Un saludo,\nEl equipo de BAEMIMPORT\n"
                + "baemimport@gmail.com";
        return enviarCorreoSimple(destinatario, asunto, cuerpo);
    }

    private Properties cargarConfiguracionCorreo() {
        Properties properties = new Properties();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("application.properties")) {
            if (input != null) {
                properties.load(input);
            }
        } catch (Exception e) {
            System.err.println("[EMAIL CONFIG ERROR] " + e.getMessage());
        }
        return properties;
    }

    private JavaMailSender crearMailSender(Properties properties) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(properties.getProperty("spring.mail.host", "smtp.gmail.com"));
        sender.setPort(Integer.parseInt(properties.getProperty("spring.mail.port", "587")));
        sender.setUsername(properties.getProperty("spring.mail.username", "baemimport@gmail.com"));
        sender.setPassword(properties.getProperty("spring.mail.password", ""));

        Properties mailProperties = sender.getJavaMailProperties();
        mailProperties.put("mail.transport.protocol", "smtp");
        mailProperties.put("mail.smtp.auth", properties.getProperty("spring.mail.properties.mail.smtp.auth", "true"));
        mailProperties.put("mail.smtp.starttls.enable", properties.getProperty("spring.mail.properties.mail.smtp.starttls.enable", "true"));
        mailProperties.put("mail.smtp.starttls.required", properties.getProperty("spring.mail.properties.mail.smtp.starttls.required", "true"));
        mailProperties.put("mail.smtp.connectiontimeout", properties.getProperty("spring.mail.properties.mail.smtp.connectiontimeout", "5000"));
        mailProperties.put("mail.smtp.timeout", properties.getProperty("spring.mail.properties.mail.smtp.timeout", "5000"));
        mailProperties.put("mail.smtp.writetimeout", properties.getProperty("spring.mail.properties.mail.smtp.writetimeout", "5000"));
        return sender;
    }

    public String getUltimoError() {
        return ultimoError;
    }
}
