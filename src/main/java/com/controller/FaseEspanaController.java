package com.controller;

import com.model.Vehiculo;
import com.service.PdfService;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URL;
import java.util.ResourceBundle;

public class FaseEspanaController implements Initializable {

    @FXML private ProgressBar      barraProgreso;
    @FXML private Label            lblProgreso;
    @FXML private DatePicker       fechaCitaItv;
    @FXML private ComboBox<String> comboProvincia;
    @FXML private CheckBox         chkFichaTecnica;
    @FXML private CheckBox         chkItvSuperada;
    @FXML private Label            estadoFichaTecnica;
    @FXML private Label            badgeItv;
    @FXML private TextField        campoPrecioCalculo;
    @FXML private TextField        campoEmisiones;
    @FXML private Label            lblTipoGravamen;
    @FXML private Label            lblImpuestoMatriculacion;
    @FXML private Label            lblImpuestoCirculacion;
    @FXML private CheckBox         chkHaciendaPagada;
    @FXML private Label            badgeHacienda;
    @FXML private CheckBox         chkDocDgt;
    @FXML private Label            estadoDocDgt;
    @FXML private ComboBox<String> comboEstadoDgt;
    @FXML private Label            badgeDgt;

    private final PdfService pdfService = new PdfService();
    private double ultimoImpMatriculacion = 0;
    private double ultimoImpCirculacion   = 0;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        comboProvincia.setItems(FXCollections.observableArrayList(
                "Albacete","Alicante","Almeria","Asturias","Avila","Badajoz","Barcelona",
                "Burgos","Caceres","Cadiz","Cantabria","Castellon","Ciudad Real","Cordoba",
                "A Coruna","Cuenca","Girona","Granada","Guadalajara","Huelva","Huesca",
                "Illes Balears","Jaen","Leon","Lleida","Lugo","Madrid","Malaga","Murcia",
                "Navarra","Ourense","Palencia","Las Palmas","Pontevedra","La Rioja",
                "Salamanca","Santa Cruz de Tenerife","Segovia","Sevilla","Soria",
                "Tarragona","Teruel","Toledo","Valencia","Valladolid","Zamora","Zaragoza"
        ));
        comboEstadoDgt.setItems(FXCollections.observableArrayList(
                "Sin iniciar",
                "Documentacion presentada",
                "En revision",
                "Aprobado  pendiente de matricula",
                "Matriculado"
        ));
        actualizarProgreso();
    }

    @FXML
    private void actualizarProgreso() {
        int completados = 0;

        boolean itvOk = chkItvSuperada.isSelected() && chkFichaTecnica.isSelected();
        badgeEstado(badgeItv, itvOk ? "completado" : chkFichaTecnica.isSelected() ? "en-proceso" : "pendiente");
        badgeDoc(estadoFichaTecnica, chkFichaTecnica.isSelected());
        if (itvOk) completados++;

        badgeEstado(badgeHacienda, chkHaciendaPagada.isSelected() ? "completado" : "pendiente");
        if (chkHaciendaPagada.isSelected()) completados++;

        String dgtVal = comboEstadoDgt.getValue();
        boolean dgtOk = "Matriculado".equals(dgtVal);
        badgeEstado(badgeDgt, dgtOk ? "completado" : dgtVal != null ? "en-proceso" : "pendiente");
        badgeDoc(estadoDocDgt, chkDocDgt.isSelected());
        if (dgtOk) completados++;

        barraProgreso.setProgress(completados / 3.0);
        lblProgreso.setText(completados + " / 3 completados");
        badgeEstado(lblProgreso, completados == 3 ? "completado" : completados > 0 ? "en-proceso" : "pendiente");
    }

    private void badgeEstado(Label lbl, String estado) {
        lbl.getStyleClass().removeAll("badge-completado", "badge-en-proceso", "badge-pendiente");
        switch (estado) {
            case "completado" -> { lbl.setText("Completado"); lbl.getStyleClass().add("badge-completado"); }
            case "en-proceso" -> { lbl.setText("En proceso"); lbl.getStyleClass().add("badge-en-proceso"); }
            default           -> { lbl.setText("Pendiente");  lbl.getStyleClass().add("badge-pendiente"); }
        }
    }

    private void badgeDoc(Label lbl, boolean ok) {
        lbl.getStyleClass().removeAll("badge-completado", "badge-pendiente");
        if (ok) { lbl.setText("Subido");    lbl.getStyleClass().add("badge-completado"); }
        else    { lbl.setText("Pendiente"); lbl.getStyleClass().add("badge-pendiente"); }
    }

    @FXML private void subirFichaTecnica() { seleccionarArchivo(chkFichaTecnica, estadoFichaTecnica); }
    @FXML private void subirDocsDgt()      { seleccionarArchivo(chkDocDgt,       estadoDocDgt); }

    private void seleccionarArchivo(CheckBox chk, Label badge) {
        FileChooser fc = new FileChooser();
        fc.setTitle("Seleccionar documento");
        fc.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Documentos", "*.pdf", "*.jpg", "*.png", "*.docx"));
        File f = fc.showOpenDialog((Stage) barraProgreso.getScene().getWindow());
        if (f != null) { chk.setSelected(true); badgeDoc(badge, true); actualizarProgreso(); }
    }

    /**
     * Calcula el Impuesto de Matriculacion segun tramos de CO2 (vigentes 2024):
     *   menor de 120 g/km  0%
     *   120160 g/km       4,75%
     *   160200 g/km       9,75%
     *   mayor de 200 g/km  14,75%
     */
    @FXML
    private void calcularImpuesto() {
        try {
            double precio    = Double.parseDouble(campoPrecioCalculo.getText().trim());
            double emisiones = Double.parseDouble(campoEmisiones.getText().trim());

            double tipo;
            String tipoLabel;
            if      (emisiones < 120) { tipo = 0.0;   tipoLabel = "0% (menos de 120 g/km)"; }
            else if (emisiones < 160) { tipo = 4.75;  tipoLabel = "4,75% (120160 g/km)"; }
            else if (emisiones < 200) { tipo = 9.75;  tipoLabel = "9,75% (160200 g/km)"; }
            else                      { tipo = 14.75; tipoLabel = "14,75% (mas de 200 g/km)"; }

            ultimoImpMatriculacion = precio * (tipo / 100.0);
            ultimoImpCirculacion   = emisiones < 120 ? 0 : emisiones < 160 ? 62 : emisiones < 200 ? 125 : 185;

            lblTipoGravamen.setText(tipoLabel);
            lblImpuestoMatriculacion.setText(String.format("%.2f EUR", ultimoImpMatriculacion));
            lblImpuestoCirculacion.setText(String.format("%.2f EUR", ultimoImpCirculacion));

        } catch (NumberFormatException e) {
            aviso("Introduce valores numericos validos para precio y emisiones.");
        }
    }

    @FXML
    private void descargarInformeImpuestos() {
        if (campoPrecioCalculo.getText().isBlank() || campoEmisiones.getText().isBlank()) {
            aviso("Calcula los impuestos primero.");
            return;
        }
        FileChooser fc = new FileChooser();
        fc.setTitle("Guardar informe de impuestos");
        fc.setInitialFileName("Informe_Impuestos_BAEMIMPORT.pdf");
        fc.getExtensionFilters().add(new FileChooser.ExtensionFilter("PDF", "*.pdf"));
        File destino = fc.showSaveDialog((Stage) barraProgreso.getScene().getWindow());
        if (destino == null) return;
        try {
            double precio    = Double.parseDouble(campoPrecioCalculo.getText().trim());
            double emisiones = Double.parseDouble(campoEmisiones.getText().trim());
            Vehiculo vehiculoDemo = new Vehiculo("BMW", "Serie 3", "WBA12345678901234",
                    precio, "AutoHaus Berlin", "En proceso");
            pdfService.generarInformeImpuestos(vehiculoDemo, precio, emisiones,
                    ultimoImpMatriculacion, ultimoImpCirculacion, destino);
            info("Informe de impuestos generado: " + destino.getName());
        } catch (Exception e) {
            aviso("No se pudo generar el PDF: " + e.getMessage());
        }
    }

    @FXML private void abrirWebItv()  { navegador("https://www.itv.es/cita-previa"); }
    @FXML private void abrirAeat()    { navegador("https://sede.agenciatributaria.gob.es"); }
    @FXML private void abrirDgt()     { navegador("https://sede.dgt.gob.es"); }

    private void navegador(String url) {
        try { Desktop.getDesktop().browse(new URI(url)); }
        catch (Exception e) { aviso("No se pudo abrir el navegador."); }
    }

    @FXML
    private void guardarEstadoDgt() {
        if (comboEstadoDgt.getValue() == null) { aviso("Selecciona el estado del tramite."); return; }
        actualizarProgreso();
        info("Estado DGT guardado: " + comboEstadoDgt.getValue());
    }

    private void info(String m)  { new Alert(Alert.AlertType.INFORMATION, m, ButtonType.OK).showAndWait(); }
    private void aviso(String m) { new Alert(Alert.AlertType.WARNING,     m, ButtonType.OK).showAndWait(); }

    @FXML private void irDashboard()    { nav("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()    { nav("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()     { nav("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania() { nav("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()   { nav("/fxml/Transporte.fxml"); }
    @FXML private void irDocumentos()   { nav("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()       { nav("/fxml/Perfil.fxml"); }

    private void nav(String ruta) {
        try {
            Parent v = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) barraProgreso.getScene().getWindow()).setScene(new Scene(v));
        } catch (IOException e) { aviso("Error al navegar: " + e.getMessage()); }
    }
}
