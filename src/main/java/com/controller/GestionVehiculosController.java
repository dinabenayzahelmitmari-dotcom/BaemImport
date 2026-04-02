package com.controller;

import com.model.Vehiculo;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.ResourceBundle;

public class GestionVehiculosController implements Initializable {

    @FXML private TableView<Vehiculo>           tablaVehiculos;
    @FXML private TableColumn<Vehiculo, String> colMarca;
    @FXML private TableColumn<Vehiculo, String> colModelo;
    @FXML private TableColumn<Vehiculo, String> colVin;
    @FXML private TableColumn<Vehiculo, String> colEstado;
    @FXML private TextField                     campoBusqueda;
    @FXML private Label                         lblTituloFormulario;
    @FXML private TextField                     campoMarca;
    @FXML private TextField                     campoModelo;
    @FXML private TextField                     campoVin;
    @FXML private TextField                     campoPrecio;
    @FXML private TextField                     campoVendedor;
    @FXML private ComboBox<String>              comboEstado;
    @FXML private Label                         lblMensaje;

    private final ObservableList<Vehiculo> listaVehiculos = FXCollections.observableArrayList();
    private Vehiculo vehiculoEnEdicion = null;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        configurarColumnas();
        comboEstado.setItems(FXCollections.observableArrayList(
                "Pendiente", "En proceso", "Completado"));
        cargarVehiculos();
    }

    private void configurarColumnas() {
        colMarca.setCellValueFactory(new PropertyValueFactory<>("marca"));
        colModelo.setCellValueFactory(new PropertyValueFactory<>("modelo"));
        colVin.setCellValueFactory(new PropertyValueFactory<>("vin"));
        colEstado.setCellValueFactory(new PropertyValueFactory<>("estado"));

        colEstado.setCellFactory(col -> new TableCell<>() {
            @Override
            protected void updateItem(String estado, boolean vacio) {
                super.updateItem(estado, vacio);
                if (vacio || estado == null) { setText(null); setStyle(""); return; }
                setText(estado);
                String color = switch (estado) {
                    case "Completado" -> "#22c55e";
                    case "En proceso" -> "#f59e0b";
                    default           -> "#ef4444";
                };
                setStyle("-fx-text-fill:" + color + "; -fx-font-weight:bold;");
            }
        });
        tablaVehiculos.setItems(listaVehiculos);
    }

    private void cargarVehiculos() {
        listaVehiculos.clear();
        // TODO: listaVehiculos.addAll(vehiculoService.obtenerTodos())
        listaVehiculos.add(new Vehiculo(
                "BMW", "Serie 3", "WBA12345678901234", 24000.0, "AutoHaus Berlin", "En proceso"));
    }

    @FXML
    private void filtrarVehiculos() {
        String f = campoBusqueda.getText().toLowerCase();
        tablaVehiculos.setItems(listaVehiculos.filtered(v ->
                v.getMarca().toLowerCase().contains(f) ||
                        v.getModelo().toLowerCase().contains(f)));
    }

    @FXML
    private void mostrarFormularioNuevo() {
        vehiculoEnEdicion = null;
        lblTituloFormulario.setText("Nuevo Vehiculo");
        limpiarFormulario();
    }

    @FXML
    private void editarVehiculo() {
        Vehiculo sel = tablaVehiculos.getSelectionModel().getSelectedItem();
        if (sel == null) { aviso("Selecciona un vehiculo para editar."); return; }
        vehiculoEnEdicion = sel;
        lblTituloFormulario.setText("Editar Vehiculo");
        campoMarca.setText(sel.getMarca());
        campoModelo.setText(sel.getModelo());
        campoVin.setText(sel.getVin());
        campoPrecio.setText(String.valueOf(sel.getPrecioCompra()));
        campoVendedor.setText(sel.getVendedor());
        comboEstado.setValue(sel.getEstado());
    }

    @FXML
    private void guardarVehiculo() {
        if (!validar()) return;

        String marca    = campoMarca.getText().trim();
        String modelo   = campoModelo.getText().trim();
        String vin      = campoVin.getText().trim().toUpperCase();
        double precio   = Double.parseDouble(campoPrecio.getText().trim());
        String vendedor = campoVendedor.getText().trim();
        String estado   = comboEstado.getValue();

        if (vehiculoEnEdicion == null) {
            listaVehiculos.add(new Vehiculo(marca, modelo, vin, precio, vendedor, estado));
            // TODO: vehiculoService.guardar(nuevo)
            mensaje("Vehiculo creado correctamente.", "#22c55e");
        } else {
            vehiculoEnEdicion.setMarca(marca);
            vehiculoEnEdicion.setModelo(modelo);
            vehiculoEnEdicion.setVin(vin);
            vehiculoEnEdicion.setPrecioCompra(precio);
            vehiculoEnEdicion.setVendedor(vendedor);
            vehiculoEnEdicion.setEstado(estado);
            // TODO: vehiculoService.actualizar(vehiculoEnEdicion)
            tablaVehiculos.refresh();
            mensaje("Vehiculo actualizado.", "#22c55e");
        }
        limpiarFormulario();
    }

    @FXML
    private void eliminarVehiculo() {
        Vehiculo sel = tablaVehiculos.getSelectionModel().getSelectedItem();
        if (sel == null) { aviso("Selecciona un vehiculo para eliminar."); return; }
        Alert c = new Alert(Alert.AlertType.CONFIRMATION,
                "Eliminar " + sel.getMarca() + " " + sel.getModelo() + "?",
                ButtonType.YES, ButtonType.NO);
        c.showAndWait().ifPresent(b -> {
            if (b == ButtonType.YES) {
                listaVehiculos.remove(sel);
                // TODO: vehiculoService.eliminar(sel.getId())
            }
        });
    }

    @FXML private void verProceso() { irFaseAlemania(); }

    private boolean validar() {
        if (campoMarca.getText().isBlank() || campoModelo.getText().isBlank() ||
                campoVin.getText().length() != 17 || campoPrecio.getText().isBlank() ||
                comboEstado.getValue() == null) {
            mensaje("Completa todos los campos. El VIN debe tener 17 caracteres.", "#ef4444");
            return false;
        }
        try { Double.parseDouble(campoPrecio.getText().trim()); }
        catch (NumberFormatException e) { mensaje("El precio debe ser un numero.", "#ef4444"); return false; }
        return true;
    }

    @FXML
    private void limpiarFormulario() {
        vehiculoEnEdicion = null;
        campoMarca.clear(); campoModelo.clear(); campoVin.clear();
        campoPrecio.clear(); campoVendedor.clear(); comboEstado.setValue(null);
        lblMensaje.setText("");
    }

    private void mensaje(String txt, String color) {
        lblMensaje.setText(txt);
        lblMensaje.setStyle("-fx-text-fill:" + color + ";");
    }

    private void aviso(String msg) {
        new Alert(Alert.AlertType.WARNING, msg, ButtonType.OK).showAndWait();
    }

    @FXML private void irDashboard()    { navegarA("/fxml/DashBoard.fxml"); }
    @FXML private void irBusqueda()     { navegarA("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania() { navegarA("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()   { navegarA("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana()   { navegarA("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos()   { navegarA("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()       { navegarA("/fxml/Perfil.fxml"); }

    private void navegarA(String ruta) {
        try {
            Parent vista = FXMLLoader.load(getClass().getResource(ruta));
            Stage stage  = (Stage) tablaVehiculos.getScene().getWindow();
            stage.setScene(new Scene(vista));
        } catch (IOException e) { mensaje("Error: " + e.getMessage(), "#ef4444"); }
    }
}
