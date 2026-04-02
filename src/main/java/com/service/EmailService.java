package com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Servicio de envio de notificaciones por correo electronico.
 */
@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    /**
     * Envia un correo de texto plano.
     */
    public boolean enviarCorreoSimple(String destinatario, String asunto, String cuerpo) {
        try {
            if (mailSender == null) {
                System.out.println("[EMAIL SIMULADO] Para: " + destinatario
                        + " | Asunto: " + asunto);
                return true;
            }
            SimpleMailMessage mensaje = new SimpleMailMessage();
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            mailSender.send(mensaje);
            return true;
        } catch (Exception e) {
            System.err.println("Error al enviar correo: " + e.getMessage());
            return false;
        }
    }

    /**
     * Envia un correo HTML enriquecido.
     */
    public boolean enviarCorreoHtml(String destinatario, String asunto, String htmlCuerpo) {
        try {
            if (mailSender == null) {
                System.out.println("[EMAIL HTML SIMULADO] Para: " + destinatario
                        + " | Asunto: " + asunto);
                return true;
            }
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");
            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(htmlCuerpo, true);
            mailSender.send(mensaje);
            return true;
        } catch (Exception e) {
            System.err.println("Error al enviar correo HTML: " + e.getMessage());
            return false;
        }
    }

    /**
     * Notificacion de bienvenida al registrarse.
     */
    public boolean enviarBienvenida(String destinatario, String nombre) {
        String asunto = "Bienvenido a BAEMIMPORT";
        String cuerpo = "Hola " + nombre + ",\n\n"
                + "Tu cuenta en BAEMIMPORT ha sido creada correctamente.\n"
                + "Ya puedes comenzar a gestionar tus importaciones de vehiculos desde Alemania.\n\n"
                + "Un saludo,\nEl equipo de BAEMIMPORT";
        return enviarCorreoSimple(destinatario, asunto, cuerpo);
    }

    /**
     * Notificacion de cambio de estado de un vehiculo.
     */
    public boolean enviarCambioEstado(String destinatario, String nombre,
                                      String vehiculo, String nuevoEstado) {
        String asunto = "Actualizacion de tu importacion — " + vehiculo;
        String cuerpo = "Hola " + nombre + ",\n\n"
                + "El estado de tu importacion ha cambiado:\n"
                + "Vehiculo: " + vehiculo + "\n"
                + "Nuevo estado: " + nuevoEstado + "\n\n"
                + "Accede a la aplicacion para ver mas detalles.\n\n"
                + "Un saludo,\nEl equipo de BAEMIMPORT";
        return enviarCorreoSimple(destinatario, asunto, cuerpo);
    }

    /**
     * Notificacion de documento pendiente.
     */
    public boolean enviarRecordatorioDocumento(String destinatario, String nombre,
                                               String documento, String fase) {
        String asunto = "Documento pendiente: " + documento;
        String cuerpo = "Hola " + nombre + ",\n\n"
                + "Tienes un documento pendiente de subir:\n"
                + "Documento: " + documento + "\n"
                + "Fase: " + fase + "\n\n"
                + "Por favor, accede a la aplicacion y completa la documentacion.\n\n"
                + "Un saludo,\nEl equipo de BAEMIMPORT";
        return enviarCorreoSimple(destinatario, asunto, cuerpo);
    }
}
