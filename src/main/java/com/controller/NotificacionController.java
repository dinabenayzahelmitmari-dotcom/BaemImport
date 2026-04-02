package com.controller;

import com.service.EmailService;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.TextArea;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;

/**
 * Controlador del centro de notificaciones.
 * Muestra alertas del sistema y permite enviar notificaciones por correo.
 */
public class NotificacionController implements Initializable {

    @FXML private VBox             listaNotificaciones;
    @FXML private TextField        campoEmailDestino;
    @FXML private ComboBox<String> comboTipoNotificacion;
    @FXML private TextArea         campoMensajePersonalizado;
    @FXML private Label            lblResultadoEnvio;
    @FXML private Label            lblTotalNoLeidas;

    private final EmailService emailService = new EmailService();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        comboTipoNotificacion.getItems().addAll(
                "Recordatorio de documento pendiente",
                "Actualizacion de estado",
                "Cita ITV proxima",
                "Mensaje personalizado"
        );
        cargarNotificaciones();
    }

    private void cargarNotificaciones() {
        listaNotificaciones.getChildren().clear();

        String[][] notificaciones = {
                {"AVISO",  "Documento pendiente", "El COC del BMW Serie 3 sigue sin subir.",    "Hace 2 horas"},
                {"INFO",   "Proceso actualizado",  "La fase de transporte ha sido confirmada.", "Hace 1 dia"},
                {"EXITO",  "Factura validada",     "La factura de compra ha sido aceptada.",    "Hace 3 dias"},
                {"ERROR",  "Error en documento",   "El TUV adjuntado no es legible. Resubirlo.", "Hace 4 dias"}
        };

        int contadorNoLeidas = 0;
        for (String[] notificacion : notificaciones) {
            listaNotificaciones.getChildren().add(
                    crearTarjetaNotificacion(notificacion[0], notificacion[1],
                            notificacion[2], notificacion[3])
            );
            if (!notificacion[0].equals("INFO")) {
                contadorNoLeidas++;
            }
        }
        lblTotalNoLeidas.setText(contadorNoLeidas + " sin leer");
    }

    private VBox crearTarjetaNotificacion(String tipo, String titulo,
                                          String mensaje, String tiempo) {
        VBox tarjeta = new VBox(6);
        String colorBorde = switch (tipo) {
            case "AVISO" -> "#f59e0b";
            case "EXITO" -> "#22c55e";
            case "ERROR" -> "#ef4444";
            default      -> "#4f6ef7";
        };
        tarjeta.setStyle("-fx-background-color:#212436; -fx-background-radius:8; "
                + "-fx-padding:14 16; -fx-border-color:" + colorBorde
                + "; -fx-border-width:0 0 0 3; -fx-border-radius:0 8 8 0;");

        HBox cabecera = new HBox(10);
        Label badgeTipo = new Label(tipo);
        badgeTipo.setStyle("-fx-text-fill:" + colorBorde + "; -fx-font-size:11px; "
                + "-fx-font-weight:bold;");
        Label lblTitulo = new Label(titulo);
        lblTitulo.setStyle("-fx-text-fill:#e8eaf0; -fx-font-size:13px; -fx-font-weight:bold;");
        Label lblTiempo = new Label(tiempo);
        lblTiempo.setStyle("-fx-text-fill:#8890a8; -fx-font-size:11px;");
        HBox espaciador = new HBox();
        HBox.setHgrow(espaciador, Priority.ALWAYS);
        cabecera.getChildren().addAll(badgeTipo, lblTitulo, espaciador, lblTiempo);

        Label lblMensaje = new Label(mensaje);
        lblMensaje.setStyle("-fx-text-fill:#8890a8; -fx-font-size:12px;");
        lblMensaje.setWrapText(true);

        tarjeta.getChildren().addAll(cabecera, lblMensaje);
        return tarjeta;
    }

    @FXML
    private void enviarNotificacionCorreo() {
        String email = campoEmailDestino.getText().trim();
        String tipo  = comboTipoNotificacion.getValue();

        if (email.isBlank() || !email.contains("@")) {
            mostrarResultado("Introduce un email valido.", false);
            return;
        }
        if (tipo == null) {
            mostrarResultado("Selecciona el tipo de notificacion.", false);
            return;
        }

        String asunto = "[BAEMIMPORT] " + tipo;
        String cuerpo = campoMensajePersonalizado.getText().isBlank()
                ? "Notificacion de BAEMIMPORT: " + tipo + "\n\nUn saludo,\nEl equipo de BAEMIMPORT\nbaemimport@gmail.com"
                : campoMensajePersonalizado.getText()
                + "\n\n--\nEnviado desde BAEMIMPORT\nbaemimport@gmail.com";

        boolean enviado = emailService.enviarCorreoSimple(email, asunto, cuerpo);

        if (enviado) {
            mostrarResultado("Correo enviado correctamente a " + email, true);
            campoEmailDestino.clear();
            campoMensajePersonalizado.clear();
            comboTipoNotificacion.setValue(null);
        } else {
            String detalle = emailService.getUltimoError();
            String mensaje = detalle == null || detalle.isBlank()
                    ? "Error al enviar el correo. Revisa la configuracion."
                    : "Error al enviar el correo: " + detalle;
            mostrarResultado(mensaje, false);
        }
    }

    private void mostrarResultado(String mensaje, boolean exito) {
        lblResultadoEnvio.setText(mensaje);
        lblResultadoEnvio.setStyle("-fx-text-fill:" + (exito ? "#22c55e" : "#ef4444") + ";");
    }

    @FXML private void irDashboard()    { navegar("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()    { navegar("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()     { navegar("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania() { navegar("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()   { navegar("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana()   { navegar("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos()   { navegar("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()       { navegar("/fxml/Perfil.fxml"); }

    private void navegar(String ruta) {
        try {
            Parent vista = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) listaNotificaciones.getScene().getWindow()).setScene(new Scene(vista));
        } catch (IOException e) {
            mostrarResultado("Error al navegar: " + e.getMessage(), false);
        }
    }
}
