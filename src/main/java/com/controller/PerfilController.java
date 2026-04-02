package com.controller;

import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.time.LocalDate;
import java.util.ResourceBundle;

public class PerfilController implements Initializable {

    @FXML private TextField     campoNombre;
    @FXML private TextField     campoDni;
    @FXML private TextField     campoEmail;
    @FXML private TextField     campoTelefono;
    @FXML private DatePicker    fechaNacimiento;
    @FXML private TextField     campoDireccion;
    @FXML private TextField     campoCiudad;
    @FXML private TextField     campoCp;
    @FXML private TextField     campoProvincia;
    @FXML private TextField     campoBanco;
    @FXML private TextField     campoIban;
    @FXML private TextField     campoDelegacionHacienda;
    @FXML private PasswordField campoPasswordActual;
    @FXML private PasswordField campoPasswordNueva;
    @FXML private PasswordField campoPasswordConfirmar;
    @FXML private Label         lblMensaje;

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        cargarDatos();
    }

    @FXML
    private void cargarDatos() {
        // TODO: cargar desde UsuarioService.obtenerActual()
        campoNombre.setText("Carlos García");
        campoDni.setText("12345678A");
        campoEmail.setText("carlos@email.com");
        campoTelefono.setText("+34 600 000 000");
        fechaNacimiento.setValue(LocalDate.of(1990, 5, 15));
        campoDireccion.setText("Calle Mayor, 1, 2A");
        campoCiudad.setText("Madrid");
        campoCp.setText("28001");
        campoProvincia.setText("Madrid");
        campoBanco.setText("CaixaBank");
        campoIban.setText("ES00 0000 0000 0000 0000 0000");
        lblMensaje.setText("");
    }

    @FXML
    private void guardarPerfil() {
        if (!validarObligatorios() || !validarFormatos()) return;
        // TODO: UsuarioService.actualizar(construirUsuario())
        mensaje("Perfil guardado correctamente.", "#22c55e");
    }

    private boolean validarObligatorios() {
        if (campoNombre.getText().isBlank() || campoDni.getText().isBlank() ||
                campoEmail.getText().isBlank()  || campoDireccion.getText().isBlank() ||
                campoCiudad.getText().isBlank()) {
            mensaje("Nombre, DNI, email, direccion y ciudad son obligatorios.", "#ef4444");
            return false;
        }
        return true;
    }

    private boolean validarFormatos() {
        if (!campoEmail.getText().contains("@")) {
            mensaje("El email no tiene un formato válido.", "#ef4444"); return false;
        }
        if (!campoCp.getText().isBlank() && !campoCp.getText().matches("\\d{5}")) {
            mensaje("El codigo postal debe tener 5 dígitos.", "#ef4444"); return false;
        }
        String iban = campoIban.getText().replaceAll("\\s", "");
        if (!iban.isBlank() && (iban.length() < 15 || iban.length() > 34)) {
            mensaje("El IBAN no tiene un formato correcto.", "#ef4444"); return false;
        }
        return true;
    }

    @FXML
    private void cambiarPassword() {
        if (campoPasswordActual.getText().isBlank() ||
                campoPasswordNueva.getText().isBlank()  ||
                campoPasswordConfirmar.getText().isBlank()) {
            mensaje("Rellena los tres campos de contrasena.", "#ef4444"); return;
        }
        if (!campoPasswordNueva.getText().equals(campoPasswordConfirmar.getText())) {
            mensaje("La nueva contrasena y la confirmación no coinciden.", "#ef4444"); return;
        }
        if (campoPasswordNueva.getText().length() < 6) {
            mensaje("La contrasena debe tener al menos 6 caracteres.", "#ef4444"); return;
        }
        // TODO: UsuarioService.cambiarPassword(actual, nueva)
        campoPasswordActual.clear(); campoPasswordNueva.clear(); campoPasswordConfirmar.clear();
        mensaje("Contrasena cambiada correctamente.", "#22c55e");
    }

    private void mensaje(String txt, String color) {
        lblMensaje.setText(txt);
        lblMensaje.setStyle("-fx-text-fill:" + color + "; -fx-font-size:13px;");
    }

    @FXML private void irDashboard()    { nav("/fxml/DashBoard.fxml"); }
    @FXML private void irVehiculos()    { nav("/fxml/GestionVehiculos.fxml"); }
    @FXML private void irBusqueda()     { nav("/fxml/BusquedaVehiculo.fxml"); }
    @FXML private void irFaseAlemania() { nav("/fxml/FaseAlemania.fxml"); }
    @FXML private void irTransporte()   { nav("/fxml/Transporte.fxml"); }
    @FXML private void irFaseEspana()   { nav("/fxml/FaseEspana.fxml"); }
    @FXML private void irDocumentos()   { nav("/fxml/CentroDocumentos.fxml"); }

    private void nav(String ruta) {
        try {
            Parent v = FXMLLoader.load(getClass().getResource(ruta));
            ((Stage) campoNombre.getScene().getWindow()).setScene(new Scene(v));
        } catch (IOException e) { mensaje("Error: " + e.getMessage(), "#ef4444"); }
    }
}
