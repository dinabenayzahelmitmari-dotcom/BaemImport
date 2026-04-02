package com.controller;

import com.model.Documento;
import com.model.Vehiculo;
import com.service.PdfService;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.stage.FileChooser;
import javafx.stage.Stage;

import java.awt.Desktop;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.util.ResourceBundle;

public class CentroDocumentosController implements Initializable {

    @FXML private TableView<Documento>            tablaDocumentos;
    @FXML private TableColumn<Documento, String>  colNombre;
    @FXML private TableColumn<Documento, String>  colFase;
    @FXML private TableColumn<Documento, String>  colTipo;
    @FXML private TableColumn<Documento, String>  colVehiculo;
    @FXML private TableColumn<Documento, String>  colFecha;
    @FXML private TableColumn<Documento, String>  colEstado;
    @FXML private TextField                       campoBusquedaDoc;
    @FXML private ComboBox<String>                comboFiltroFase;
    @FXML private ComboBox<String>                comboFiltroTipo;
    @FXML private Label                           lblInfoSeleccion;

    private final ObservableList<Documento> todos = FXCollections.observableArrayList();
    private final PdfService pdfService = new PdfService();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        configurarColumnas();
        comboFiltroFase.setItems(FXCollections.observableArrayList(
                "Todas las fases", "Alemania", "Transporte",
                "Espana  ITV", "Espana  Hacienda", "Espana  DGT"));
        comboFiltroTipo.setItems(FXCollections.observableArrayList(
                "Todos", "PDF", "Imagen", "Word"));
        cargarDocumentos();
        tablaDocumentos.getSelectionModel().selectedItemProperty()
                .addListener((obs, ant, sel) ->
                        lblInfoSeleccion.setText(sel == null ? "" :
                                sel.getNombre() + "  |  " + sel.getFase() + "  |  " + sel.getFechaSubida()));
    }

    private void configurarColumnas() {
        colNombre.setCellValueFactory(new PropertyValueFactory<>("nombre"));
        colFase.setCellValueFactory(new PropertyValueFactory<>("fase"));
        colTipo.setCellValueFactory(new PropertyValueFactory<>("tipo"));
        colVehiculo.setCellValueFactory(new PropertyValueFactory<>("vehiculo"));
        colFecha.setCellValueFactory(new PropertyValueFactory<>("fechaSubida"));
        colEstado.setCellValueFactory(new PropertyValueFactory<>("estado"));

        colEstado.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String estado, boolean vacio) {
                super.updateItem(estado, vacio);
                if (vacio || estado == null) { setText(null); setStyle(""); return; }
                setText(estado);
                String color = switch (estado) {
                    case "Validado"  -> "#22c55e";
                    case "Pendiente" -> "#ef4444";
                    default          -> "#f59e0b";
                };
                setStyle("-fx-text-fill:" + color + "; -fx-font-weight:bold;");
            }
        });
        tablaDocumentos.setItems(todos);
    }

    private void cargarDocumentos() {
        todos.clear();
        // Datos de ejemplo; en produccion: documentoService.obtenerTodos()
        todos.addAll(
                new Documento("Factura de compra",  "Alemania",       "PDF", "BMW Serie 3", LocalDate.now().toString(), "Validado"),
                new Documento("Tail 1",             "Alemania",       "PDF", "BMW Serie 3", LocalDate.now().toString(), "Validado"),
                new Documento("COC",                "Alemania",       "PDF", "BMW Serie 3", LocalDate.now().toString(), "Pendiente"),
                new Documento("Seguro transporte",  "Transporte",     "PDF", "BMW Serie 3", LocalDate.now().toString(), "Revision"),
                new Documento("Ficha tecnica",      "Espana  ITV",   "PDF", "BMW Serie 3", LocalDate.now().toString(), "Pendiente")
        );
    }

    @FXML
    private void filtrarDocumentos() {
        String txt  = campoBusquedaDoc.getText().toLowerCase();
        String fase = comboFiltroFase.getValue();
        String tipo = comboFiltroTipo.getValue();
        tablaDocumentos.setItems(todos.filtered(d -> {
            boolean porNombre = txt.isBlank()  || d.getNombre().toLowerCase().contains(txt);
            boolean porFase   = fase == null   || fase.equals("Todas las fases") || d.getFase().equals(fase);
            boolean porTipo   = tipo == null   || tipo.equals("Todos") || d.getTipo().equalsIgnoreCase(tipo);
            return porNombre && porFase && porTipo;
        }));
    }

    @FXML
    private void limpiarFiltros() {
        campoBusquedaDoc.clear();
        comboFiltroFase.setValue(null);
        comboFiltroTipo.setValue(null);
        tablaDocumentos.setItems(todos);
    }

    @FXML
    private void verDocumento() {
        Documento sel = tablaDocumentos.getSelectionModel().getSelectedItem();
        if (sel == null) { aviso("Selecciona un documento para ver."); return; }
        try {
            File f = new File(sel.getRutaArchivo() != null ? sel.getRutaArchivo() : "");
            if (f.exists()) Desktop.getDesktop().open(f);
            else aviso("El archivo no se encuentra en el sistema.");
        } catch (IOException e) { aviso("No se pudo abrir el archivo."); }
    }

    @FXML
    private void descargarDocumento() {
        Documento sel = tablaDocumentos.getSelectionModel().getSelectedItem();
        if (sel == null) { aviso("Selecciona un documento para descargar."); return; }
        FileChooser fc = new FileChooser();
        fc.setTitle("Guardar como...");
        fc.setInitialFileName(sel.getNombre() + ".pdf");
        fc.getExtensionFilters().add(new FileChooser.ExtensionFilter("PDF", "*.pdf"));
        File destino = fc.showSaveDialog((Stage) tablaDocumentos.getScene().getWindow());
        if (destino != null) {
            info("Guardado en: " + destino.getAbsolutePath());
        }
    }

    @FXML
    private void descargarInformePdf() {
        FileChooser fc = new FileChooser();
        fc.setTitle("Guardar informe PDF");
        fc.setInitialFileName("Informe_Documentos_BAEMIMPORT.pdf");
        fc.getExtensionFilters().add(new FileChooser.ExtensionFilter("PDF", "*.pdf"));
        File destino = fc.showSaveDialog((Stage) tablaDocumentos.getScene().getWindow());
        if (destino == null) return;
        try {
            // Vehiculo de ejemplo; en produccion se carga desde servicio
            Vehiculo vehiculoDemo = new Vehiculo("BMW", "Serie 3", "WBA12345678901234",
                    24000.0, "AutoHaus Berlin", "En proceso");
            pdfService.generarInformeDocumentos(vehiculoDemo, destino);
            info("Informe PDF generado en: " + destino.getName());
        } catch (Exception e) {
            aviso("No se pudo generar el PDF: " + e.getMessage());
        }
    }

    @FXML
    private void eliminarDocumento() {
        Documento sel = tablaDocumentos.getSelectionModel().getSelectedItem();
        if (sel == null) { aviso("Selecciona un documento para eliminar."); return; }
        Alert c = new Alert(Alert.AlertType.CONFIRMATION,
                "Eliminar '" + sel.getNombre() + "'?", ButtonType.YES, ButtonType.NO);
        c.showAndWait().ifPresent(b -> {
            if (b == ButtonType.YES) todos.remove(sel);
        });
    }

    @FXML
    private void subirNuevoDocumento() {
        FileChooser fc = new FileChooser();
        fc.setTitle("Seleccionar documento");
        fc.getExtensionFilters().add(
                new FileChooser.ExtensionFilter("Documentos", "*.pdf", "*.jpg", "*.png", "*.docx"));
        File f = fc.showOpenDialog((Stage) tablaDocumentos.getScene().getWindow());
        if (f != null) {
            String ext = f.getName().contains(".")
                    ? f.getName().substring(f.getName().lastIndexOf('.') + 1).toUpperCase() : "DOC";
            Documento nuevo = new Documento(
                    f.getName(), "Sin asignar", ext, "Sin vehiculo",
                    LocalDate.now().toString(), "Pendiente");
            nuevo.setRutaArchivo(f.getAbsolutePath());
            todos.add(nuevo);
            info("Documento subido: " + f.getName());
        }
    }

    private void info(String m)  { new Alert(Alert.AlertType.INFORMATION, m, ButtonType.OK).showAndWait(); }
    private void aviso(String m) { new Alert(Alert.AlertType.WARNING,     m, ButtonType.OK).showAndWait(); }

    @FXML private void irDashboard()    { nav("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()    { nav("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()     { nav("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania() { nav("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()   { nav("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana()   { nav("/fxml/FaseEspana.fxml"); }
    @FXML private void irPerfil()       { nav("/fxml/Perfil.fxml"); }

    private void nav(String ruta) {
        try {
            Parent v = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) tablaDocumentos.getScene().getWindow()).setScene(new Scene(v));
        } catch (IOException e) { aviso("Error: " + e.getMessage()); }
    }
}
