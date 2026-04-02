package com.controller;

import com.util.SesionUsuario;
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

public class DashboardController implements Initializable {

    @FXML private Label       lblBienvenida;
    @FXML private Label       lblTotalVehiculos;
    @FXML private Label       lblDocsPendientes;
    @FXML private Label       lblPorcentaje;
    @FXML private ProgressBar barraProgreso;
    @FXML private Label       lblVehiculo;
    @FXML private Label       lblEstadoVehiculo;
    @FXML private Label       lblFaseActual;
    @FXML private Label       estadoAlemania;
    @FXML private Label       estadoTransporte;
    @FXML private Label       estadoEspana;
    @FXML private VBox        listaTareas;
    @FXML private Label       lblSinTareas;
    @FXML private Label       lblUsuarioNombre;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        cargarDatosDashboard();
    }

    private void cargarDatosDashboard() {
        String nombre = "Usuario";
        if (SesionUsuario.getInstancia().haySesionActiva()) {
            nombre = SesionUsuario.getInstancia().getUsuarioActual().getNombre();
        }
        lblBienvenida.setText("Bienvenido de nuevo, " + nombre);
        if (lblUsuarioNombre != null) lblUsuarioNombre.setText(nombre);

        actualizarResumen(1, 3, 45);
        actualizarVehiculoActivo("BMW Serie 3 2021", "En proceso", "Alemania");
        actualizarFases("en-proceso", "pendiente", "pendiente");
        cargarTareasPendientes();
    }

    private void actualizarResumen(int vehiculos, int docs, int porcentaje) {
        lblTotalVehiculos.setText(String.valueOf(vehiculos));
        lblDocsPendientes.setText(String.valueOf(docs));
        lblPorcentaje.setText(porcentaje + "%");
        barraProgreso.setProgress(porcentaje / 100.0);
    }

    private void actualizarVehiculoActivo(String nombre, String estado, String fase) {
        lblVehiculo.setText(nombre);
        lblFaseActual.setText(fase);
        lblEstadoVehiculo.setText(estado);
        lblEstadoVehiculo.getStyleClass()
                .removeAll("badge-completado", "badge-en-proceso", "badge-pendiente");
        switch (estado.toLowerCase()) {
            case "completado" -> lblEstadoVehiculo.getStyleClass().add("badge-completado");
            case "en proceso" -> lblEstadoVehiculo.getStyleClass().add("badge-en-proceso");
            default           -> lblEstadoVehiculo.getStyleClass().add("badge-pendiente");
        }
    }

    private void actualizarFases(String alemania, String transporte, String espana) {
        aplicarBadgeFase(estadoAlemania,   alemania);
        aplicarBadgeFase(estadoTransporte, transporte);
        aplicarBadgeFase(estadoEspana,     espana);
    }

    private void aplicarBadgeFase(Label label, String estado) {
        label.getStyleClass()
                .removeAll("badge-completado", "badge-en-proceso", "badge-pendiente");
        switch (estado) {
            case "completado" -> { label.setText("Completado"); label.getStyleClass().add("badge-completado"); }
            case "en-proceso" -> { label.setText("En proceso"); label.getStyleClass().add("badge-en-proceso"); }
            default           -> { label.setText("Pendiente");  label.getStyleClass().add("badge-pendiente"); }
        }
    }

    private void cargarTareasPendientes() {
        listaTareas.getChildren().clear();
        String[] tareas = {
                "Subir Certificado de Conformidad (COC)",
                "Revisar TUV del vehiculo",
                "Contratar seguro de transporte"
        };
        if (tareas.length == 0) {
            lblSinTareas.setVisible(true);
            return;
        }
        for (String tarea : tareas) {
            HBox fila = new HBox(12);
            fila.setStyle("-fx-alignment:center-left; -fx-padding:8 12; "
                    + "-fx-background-color:#212436; -fx-background-radius:8;");
            Label punto = new Label("");
            punto.setStyle("-fx-text-fill:#f59e0b; -fx-font-size:16px;");
            Label texto = new Label(tarea);
            texto.getStyleClass().add("texto-normal");
            fila.getChildren().addAll(punto, texto);
            listaTareas.getChildren().add(fila);
        }
    }

    @FXML private void irDashboard()        { /* ya estamos */ }
    @FXML private void irGestionVehiculos() { navegarA("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()         { navegarA("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania()     { navegarA("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()       { navegarA("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana()       { navegarA("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos()       { navegarA("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()           { navegarA("/fxml/Perfil.fxml"); }
    @FXML private void abrirNotificaciones(){ navegarA("/fxml/Notificaciones.fxml"); }

    @FXML
    private void cerrarSesion() {
        SesionUsuario.getInstancia().cerrarSesion();
        try {
            Parent vista = FXMLLoader.load(getClass().getResource("/fxml/Login.fxml"));
            Stage stage  = (Stage) lblBienvenida.getScene().getWindow();
            stage.setScene(new Scene(vista, 900, 600));
        } catch (IOException e) {
            new Alert(Alert.AlertType.ERROR, "Error al cerrar sesion.", ButtonType.OK).showAndWait();
        }
    }

    private void navegarA(String ruta) {
        try {
            Parent vista = FXMLLoader.load(getClass().getResource(ruta));
            Stage stage  = (Stage) lblBienvenida.getScene().getWindow();
            stage.setScene(new Scene(vista));
        } catch (IOException e) {
            new Alert(Alert.AlertType.ERROR, "Error al navegar: " + e.getMessage(),
                    ButtonType.OK).showAndWait();
        }
    }
}
