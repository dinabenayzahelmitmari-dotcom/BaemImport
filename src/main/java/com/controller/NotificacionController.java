package com.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;

/**
 * Controlador del centro de notificaciones.
 * Muestra alertas del sistema y permite enviar correos de recordatorio.
 */
public class NotificacionController implements Initializable {

    @FXML private VBox          listaNotificaciones;
    @FXML private TextField     campoEmailDestino;
    @FXML private ComboBox<String> comboTipoNotificacion;
    @FXML private TextArea      campoMensajePersonalizado;
    @FXML private Label         lblResultadoEnvio;
    @FXML private Label         lblTotalNoLeidas;

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
        String[][] notifs = {
                {"AVISO",  "Documento pendiente", "El COC del BMW Serie 3 sigue sin subir.",      "Hace 2 horas"},
                {"INFO",   "Proceso actualizado",  "La fase de transporte ha sido confirmada.",    "Hace 1 dia"},
                {"EXITO",  "Factura validada",     "La factura de compra ha sido aceptada.",       "Hace 3 dias"},
                {"ERROR",  "Error en documento",   "El TUV adjuntado no es legible. Resubirlo.",   "Hace 4 dias"}
        };

        int noLeidas = 0;
        for (String[] n : notifs) {
            listaNotificaciones.getChildren().add(crearFilaNotificacion(n[0], n[1], n[2], n[3]));
            if (!n[0].equals("INFO")) noLeidas++;
        }
        lblTotalNoLeidas.setText(noLeidas + " sin leer");
    }

    private VBox crearFilaNotificacion(String tipo, String titulo, String mensaje, String tiempo) {
        VBox tarjeta = new VBox(6);
        String colorBorde = switch (tipo) {
            case "AVISO"  -> "#f59e0b";
            case "EXITO"  -> "#22c55e";
            case "ERROR"  -> "#ef4444";
            default       -> "#4f6ef7";
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
        HBox.setHgrow(espaciador, javafx.scene.layout.Priority.ALWAYS);
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

        // Simulacion de envio (en produccion usa EmailService)
        String asunto = tipo;
        String cuerpo = campoMensajePersonalizado.getText().isBlank()
                ? "Notificacion automatica de BAEMIMPORT: " + tipo
                : campoMensajePersonalizado.getText();

        System.out.println("[CORREO] Para: " + email + " | Asunto: " + asunto);
        mostrarResultado("Correo enviado correctamente a " + email, true);
        campoEmailDestino.clear();
        campoMensajePersonalizado.clear();
        comboTipoNotificacion.setValue(null);
    }

    private void mostrarResultado(String mensaje, boolean exito) {
        lblResultadoEnvio.setText(mensaje);
        lblResultadoEnvio.setStyle("-fx-text-fill:" + (exito ? "#22c55e" : "#ef4444") + ";");
    }

    @FXML private void irDashboard()    { nav("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()    { nav("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()     { nav("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania() { nav("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()   { nav("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana()   { nav("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos()   { nav("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()       { nav("/fxml/Perfil.fxml"); }

    private void nav(String ruta) {
        try {
            Parent v = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) listaNotificaciones.getScene().getWindow()).setScene(new Scene(v));
        } catch (IOException e) {
            mostrarResultado("Error al navegar: " + e.getMessage(), false);
        }
    }
}
