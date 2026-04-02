package com.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.input.Clipboard;
import javafx.scene.input.ClipboardContent;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ResourceBundle;

public class FaseAlemaniaController implements Initializable {

    @FXML private CheckBox    chkFactura;
    @FXML private CheckBox    chkTail1;
    @FXML private CheckBox    chkTail2;
    @FXML private CheckBox    chkCoc;
    @FXML private CheckBox    chkSeguroMatriculas;
    @FXML private CheckBox    chkTuv;
    @FXML private Label       estadoFactura;
    @FXML private Label       estadoTail1;
    @FXML private Label       estadoTail2;
    @FXML private Label       estadoCoc;
    @FXML private Label       estadoSeguroMatriculas;
    @FXML private Label       estadoTuv;
    @FXML private ProgressBar barraProgreso;
    @FXML private Label       lblProgreso;
    @FXML private TextArea    areaPreguntas;
    @FXML private RadioButton radioRoja;
    @FXML private RadioButton radioAmarilla;
    @FXML private Label       lblTipoMatricula;

    private final ToggleGroup grupoMatricula = new ToggleGroup();

    private static final String PLANTILLA =
            "Hola, estoy interesado en el vehiculo. Me gustaria hacerle las siguientes preguntas:\n\n" +
                    "1. El vehiculo funciona correctamente y sin ningun problema?\n" +
                    "2. Ha sufrido algun accidente o reparacion importante?\n" +
                    "3. Cuando fue el ultimo mantenimiento realizado y que se hizo?\n" +
                    "4. El TUV esta vigente? Hasta que fecha?\n" +
                    "5. Dispone del historial de revisiones del vehiculo?\n" +
                    "6. Tiene todos los documentos originales (Tail 1, Tail 2, factura)?\n" +
                    "7. Ha tenido el vehiculo algun propietario anterior?\n\n" +
                    "Muchas gracias de antemano.";

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        radioRoja.setToggleGroup(grupoMatricula);
        radioAmarilla.setToggleGroup(grupoMatricula);
        areaPreguntas.setText(PLANTILLA);
        actualizarProgreso();
    }

    @FXML
    private void actualizarProgreso() {
        CheckBox[] checks = { chkFactura, chkTail1, chkTail2, chkCoc, chkSeguroMatriculas, chkTuv };
        Label[]    badges = { estadoFactura, estadoTail1, estadoTail2, estadoCoc, estadoSeguroMatriculas, estadoTuv };
        int completados = 0;
        for (int i = 0; i < checks.length; i++) {
            actualizarBadge(badges[i], checks[i].isSelected());
            if (checks[i].isSelected()) completados++;
        }
        barraProgreso.setProgress((double) completados / checks.length);
        lblProgreso.setText(completados + " / " + checks.length + " completados");
        lblProgreso.getStyleClass().removeAll("badge-completado", "badge-en-proceso", "badge-pendiente");
        if      (completados == checks.length) lblProgreso.getStyleClass().add("badge-completado");
        else if (completados > 0)              lblProgreso.getStyleClass().add("badge-en-proceso");
        else                                   lblProgreso.getStyleClass().add("badge-pendiente");
    }

    private void actualizarBadge(Label lbl, boolean ok) {
        lbl.getStyleClass().removeAll("badge-completado", "badge-pendiente");
        if (ok) { lbl.setText("Subido");    lbl.getStyleClass().add("badge-completado"); }
        else    { lbl.setText("Pendiente"); lbl.getStyleClass().add("badge-pendiente"); }
    }

    @FXML private void subirFactura()          { seleccionarArchivo(chkFactura,          estadoFactura); }
    @FXML private void subirTail1()            { seleccionarArchivo(chkTail1,             estadoTail1); }
    @FXML private void subirTail2()            { seleccionarArchivo(chkTail2,             estadoTail2); }
    @FXML private void subirCoc()              { seleccionarArchivo(chkCoc,               estadoCoc); }
    @FXML private void subirSeguroMatriculas() { seleccionarArchivo(chkSeguroMatriculas,  estadoSeguroMatriculas); }
    @FXML private void subirTuv()              { seleccionarArchivo(chkTuv,               estadoTuv); }

    private void seleccionarArchivo(CheckBox chk, Label badge) {
        FileChooser fc = new FileChooser();
        fc.setTitle("Seleccionar documento");
        fc.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Documentos", "*.pdf", "*.jpg", "*.png", "*.docx"));
        File f = fc.showOpenDialog((Stage) barraProgreso.getScene().getWindow());
        if (f != null) {
            chk.setSelected(true);
            actualizarBadge(badge, true);
            actualizarProgreso();
        }
    }

    @FXML
    private void copiarPreguntas() {
        ClipboardContent cc = new ClipboardContent();
        cc.putString(areaPreguntas.getText());
        Clipboard.getSystemClipboard().setContent(cc);
        info("Texto copiado al portapapeles.");
    }

    @FXML
    private void enviarEmail() {
        try {
            String cuerpo = URLEncoder.encode(areaPreguntas.getText(), StandardCharsets.UTF_8)
                    .replace("+", "%20");
            String asunto = URLEncoder.encode("Preguntas sobre el vehiculo", StandardCharsets.UTF_8);
            Desktop.getDesktop().mail(new URI("mailto:?subject=" + asunto + "&body=" + cuerpo));
        } catch (Exception e) { error("No se pudo abrir el cliente de email."); }
    }

    @FXML
    private void enviarWhatsapp() {
        try {
            String txt = URLEncoder.encode(areaPreguntas.getText(), StandardCharsets.UTF_8);
            Desktop.getDesktop().browse(new URI("https://wa.me/?text=" + txt));
        } catch (Exception e) { error("No se pudo abrir WhatsApp."); }
    }

    @FXML private void restaurarPlantilla() { areaPreguntas.setText(PLANTILLA); }

    @FXML
    private void guardarMatricula() {
        if (radioRoja.isSelected()) {
            lblTipoMatricula.setText("Matricula roja");
            lblTipoMatricula.getStyleClass().removeAll("badge-pendiente", "badge-completado");
            lblTipoMatricula.getStyleClass().add("badge-en-proceso");
        } else if (radioAmarilla.isSelected()) {
            lblTipoMatricula.setText("Matricula amarilla");
            lblTipoMatricula.getStyleClass().removeAll("badge-pendiente", "badge-en-proceso");
            lblTipoMatricula.getStyleClass().add("badge-completado");
        } else {
            aviso("Selecciona un tipo de matricula.");
        }
    }

    private void info(String m)  { new Alert(Alert.AlertType.INFORMATION, m, ButtonType.OK).showAndWait(); }
    private void aviso(String m) { new Alert(Alert.AlertType.WARNING,     m, ButtonType.OK).showAndWait(); }
    private void error(String m) { new Alert(Alert.AlertType.ERROR,       m, ButtonType.OK).showAndWait(); }

    @FXML private void irDashboard()  { nav("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()  { nav("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()   { nav("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irTransporte() { nav("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana() { nav("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos() { nav("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()     { nav("/fxml/Perfil.fxml"); }

    private void nav(String ruta) {
        try {
            Parent v = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) barraProgreso.getScene().getWindow()).setScene(new Scene(v));
        } catch (IOException e) { error("Error al navegar: " + e.getMessage()); }
    }
}
