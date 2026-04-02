package com.controller;

import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.ResourceBundle;

public class BusquedaVehiculoController implements Initializable {

    @FXML private ComboBox<String> comboMarca;
    @FXML private TextField        campoModelo;
    @FXML private TextField        campoAnioMin;
    @FXML private TextField        campoPrecioMax;
    @FXML private TextField        campoKmMax;
    @FXML private TextField        campoPotencia;
    @FXML private CheckBox         chkGasolina;
    @FXML private CheckBox         chkDiesel;
    @FXML private CheckBox         chkHibrido;
    @FXML private CheckBox         chkElectrico;
    @FXML private CheckBox         chkGas;
    @FXML private CheckBox         chkNavegador;
    @FXML private CheckBox         chkCamaraTrasera;
    @FXML private CheckBox         chkSensorAparcamiento;
    @FXML private CheckBox         chkLlavedePuerta;
    @FXML private CheckBox         chkTechoSolar;
    @FXML private CheckBox         chkAsientosCalef;
    @FXML private CheckBox         chkCarPlay;
    @FXML private CheckBox         chkLedMatrix;
    @FXML private CheckBox         chkPilotoAutomatico;
    @FXML private ComboBox<String> comboRegion;
    @FXML private TextArea         campoNotas;
    @FXML private Label            lblMensaje;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        comboMarca.setItems(FXCollections.observableArrayList(
                "Audi","BMW","Mercedes-Benz","Volkswagen","Porsche",
                "Opel","Ford","Toyota","Seat","Skoda","Peugeot",
                "Renault","Volvo","Hyundai","Kia","Tesla","Otra"));
        comboRegion.setItems(FXCollections.observableArrayList(
                "Cualquier región",
                "Bavaria (Múnich)",
                "Renania del Norte-Westfalia (Düsseldorf/Colonia)",
                "Baden-Württemberg (Stuttgart)",
                "Berlín / Brandeburgo",
                "Hamburgo","Sajonia","Hesse (Frankfurt)"));
        comboRegion.setValue("Cualquier región");
        // TODO: cargar preferencias guardadas desde BusquedaVehiculoService
    }

    @FXML
    private void guardarPreferencias() {
        if (!validar()) return;

        List<String> combustibles = new ArrayList<>();
        if (chkGasolina.isSelected())  combustibles.add("Gasolina");
        if (chkDiesel.isSelected())    combustibles.add("Diésel");
        if (chkHibrido.isSelected())   combustibles.add("Híbrido");
        if (chkElectrico.isSelected()) combustibles.add("Eléctrico");
        if (chkGas.isSelected())       combustibles.add("Gas");

        List<String> extras = new ArrayList<>();
        if (chkNavegador.isSelected())           extras.add("Navegador GPS");
        if (chkCamaraTrasera.isSelected())       extras.add("Cámara trasera");
        if (chkSensorAparcamiento.isSelected())  extras.add("Sensores aparcamiento");
        if (chkLlavedePuerta.isSelected())       extras.add("Entrada sin llave");
        if (chkTechoSolar.isSelected())          extras.add("Techo solar");
        if (chkAsientosCalef.isSelected())       extras.add("Asientos calefactados");
        if (chkCarPlay.isSelected())             extras.add("CarPlay/Android Auto");
        if (chkLedMatrix.isSelected())           extras.add("Faros LED/Matrix");
        if (chkPilotoAutomatico.isSelected())    extras.add("Piloto automático");

        // TODO: busquedaVehiculoService.guardar(...)
        mensaje("Preferencias guardadas correctamente.", "#22c55e");
    }

    private boolean validar() {
        if ((comboMarca.getValue() == null || comboMarca.getValue().isBlank())
                && campoModelo.getText().isBlank()) {
            mensaje("Indica al menos la marca o el modelo.", "#ef4444");
            return false;
        }
        if (!campoAnioMin.getText().isBlank()) {
            try {
                int a = Integer.parseInt(campoAnioMin.getText().trim());
                if (a < 1990 || a > 2025) throw new NumberFormatException();
            } catch (NumberFormatException e) {
                mensaje("El año debe estar entre 1990 y 2025.", "#ef4444");
                return false;
            }
        }
        if (!campoPrecioMax.getText().isBlank()) {
            try { Double.parseDouble(campoPrecioMax.getText().trim()); }
            catch (NumberFormatException e) { mensaje("El precio debe ser un numero.", "#ef4444"); return false; }
        }
        if (!campoKmMax.getText().isBlank()) {
            try { Integer.parseInt(campoKmMax.getText().trim()); }
            catch (NumberFormatException e) { mensaje("Los km deben ser un numero entero.", "#ef4444"); return false; }
        }
        return true;
    }

    @FXML
    private void limpiarFormulario() {
        comboMarca.setValue(null); campoModelo.clear();
        campoAnioMin.clear(); campoPrecioMax.clear();
        campoKmMax.clear(); campoPotencia.clear();
        chkGasolina.setSelected(false); chkDiesel.setSelected(false);
        chkHibrido.setSelected(false);  chkElectrico.setSelected(false);
        chkGas.setSelected(false);
        chkNavegador.setSelected(false);      chkCamaraTrasera.setSelected(false);
        chkSensorAparcamiento.setSelected(false); chkLlavedePuerta.setSelected(false);
        chkTechoSolar.setSelected(false);     chkAsientosCalef.setSelected(false);
        chkCarPlay.setSelected(false);        chkLedMatrix.setSelected(false);
        chkPilotoAutomatico.setSelected(false);
        comboRegion.setValue("Cualquier región");
        campoNotas.clear();
        lblMensaje.setText("");
    }

    private void mensaje(String txt, String color) {
        lblMensaje.setText(txt);
        lblMensaje.setStyle("-fx-text-fill:" + color + ";");
    }

    @FXML private void irDashboard()    { nav("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()    { nav("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irFaseAlemania() { nav("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()   { nav("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana()   { nav("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos()   { nav("/fxml/CentroDocumentos.fxml"); }
    @FXML private void irPerfil()       { nav("/fxml/Perfil.fxml"); }

    private void nav(String ruta) {
        try {
            Parent v = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) comboMarca.getScene().getWindow()).setScene(new Scene(v));
        } catch (IOException e) { mensaje("Error: " + e.getMessage(), "#ef4444"); }
    }
}
