package com.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;

public class TransporteController implements Initializable {

    @FXML private RadioButton  radioConduccion;
    @FXML private RadioButton  radioCamion;
    @FXML private Label        lblTipoSeleccionado;
    @FXML private Label        lblEstadoTransporte;
    @FXML private DatePicker   fechaSalida;
    @FXML private DatePicker   fechaLlegada;
    @FXML private TextField    campoEmpresaTransporte;
    @FXML private CheckBox     chkSeguroTransporte;
    @FXML private CheckBox     chkContratoTransporte;
    @FXML private Label        estadoSeguroTransporte;
    @FXML private Label        estadoContratoTransporte;
    @FXML private TextArea     campoNotas;

    private final ToggleGroup grupoTransporte = new ToggleGroup();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        radioConduccion.setToggleGroup(grupoTransporte);
        radioCamion.setToggleGroup(grupoTransporte);
        actualizarEstado();
    }

    @FXML
    private void seleccionarConduccion() {
        lblTipoSeleccionado.setText("🧑‍✈️ Conducción propia");
        lblTipoSeleccionado.getStyleClass().removeAll("badge-pendiente", "badge-completado", "badge-en-proceso");
        lblTipoSeleccionado.getStyleClass().add("badge-en-proceso");
        campoEmpresaTransporte.setDisable(true);
        campoEmpresaTransporte.clear();
    }

    @FXML
    private void seleccionarCamion() {
        lblTipoSeleccionado.setText("🚛 Camión");
        lblTipoSeleccionado.getStyleClass().removeAll("badge-pendiente", "badge-completado", "badge-en-proceso");
        lblTipoSeleccionado.getStyleClass().add("badge-en-proceso");
        campoEmpresaTransporte.setDisable(false);
    }

    @FXML
    private void actualizarEstado() {
        badge(estadoSeguroTransporte,   chkSeguroTransporte.isSelected());
        badge(estadoContratoTransporte, chkContratoTransporte.isSelected());

        boolean todo = chkSeguroTransporte.isSelected()
                && chkContratoTransporte.isSelected()
                && grupoTransporte.getSelectedToggle() != null;

        lblEstadoTransporte.getStyleClass().removeAll("badge-completado", "badge-en-proceso", "badge-pendiente");
        if (todo) {
            lblEstadoTransporte.setText("Completado");
            lblEstadoTransporte.getStyleClass().add("badge-completado");
        } else if (grupoTransporte.getSelectedToggle() != null) {
            lblEstadoTransporte.setText("En proceso");
            lblEstadoTransporte.getStyleClass().add("badge-en-proceso");
        } else {
            lblEstadoTransporte.setText("Pendiente");
            lblEstadoTransporte.getStyleClass().add("badge-pendiente");
        }
    }

    @FXML private void subirSeguro()   { seleccionarArchivo(chkSeguroTransporte,   estadoSeguroTransporte); }
    @FXML private void subirContrato() { seleccionarArchivo(chkContratoTransporte, estadoContratoTransporte); }

    private void seleccionarArchivo(CheckBox chk, Label badge) {
        FileChooser fc = new FileChooser();
        fc.setTitle("Seleccionar documento");
        fc.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Documentos", "*.pdf", "*.jpg", "*.png", "*.docx"));
        File f = fc.showOpenDialog((Stage) lblEstadoTransporte.getScene().getWindow());
        if (f != null) {
            chk.setSelected(true);
            badge(badge, true);
            actualizarEstado();
        }
    }

    private void badge(Label lbl, boolean ok) {
        lbl.getStyleClass().removeAll("badge-completado", "badge-pendiente");
        if (ok) { lbl.setText("✅ Subido");  lbl.getStyleClass().add("badge-completado"); }
        else    { lbl.setText("Pendiente");  lbl.getStyleClass().add("badge-pendiente"); }
    }

    @FXML
    private void guardarTransporte() {
        if (grupoTransporte.getSelectedToggle() == null) {
            aviso("Selecciona el tipo de transporte."); return;
        }
        if (fechaSalida.getValue() == null || fechaLlegada.getValue() == null) {
            aviso("Introduce las fechas de salida y llegada."); return;
        }
        if (fechaLlegada.getValue().isBefore(fechaSalida.getValue())) {
            aviso("La fecha de llegada no puede ser anterior a la de salida."); return;
        }
        // TODO: ProcesoImportacionService.guardarTransporte(...)
        actualizarEstado();
        info("✅ Datos de transporte guardados correctamente.");
    }

    private void info(String m)  { new Alert(Alert.AlertType.INFORMATION, m, ButtonType.OK).showAndWait(); }
    private void aviso(String m) { new Alert(Alert.AlertType.WARNING,     m, ButtonType.OK).showAndWait(); }

    @FXML private void irDashboard()    { nav("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()    { nav("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()     { nav("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania() { nav("/fxml/FaseAlemania.fxml"); }
    @FXML private void irFaseEspana()   { nav("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos()   { nav("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()       { nav("/fxml/Perfil.fxml"); }

    private void nav(String ruta) {
        try {
            Parent v = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) lblEstadoTransporte.getScene().getWindow()).setScene(new Scene(v));
        } catch (IOException e) { aviso("Error al navegar: " + e.getMessage()); }
    }
}