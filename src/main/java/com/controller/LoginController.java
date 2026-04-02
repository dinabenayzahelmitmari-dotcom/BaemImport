package com.controller;

import com.model.Usuario;
import com.service.LocalAuthService;
import com.util.SesionUsuario;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.fxml.Initializable;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.stage.Stage;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.net.URL;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Optional;
import java.util.ResourceBundle;

/**
 * Controlador del login y registro de usuarios.
 * Gestiona autenticacion con BCrypt y sesion global.
 */
public class LoginController implements Initializable {

    // Login
    @FXML private TextField     campoEmailLogin;
    @FXML private PasswordField campoPasswordLogin;
    @FXML private Label         lblErrorLogin;
    @FXML private Button        btnLogin;

    // Registro
    @FXML private TextField     campoNombreRegistro;
    @FXML private TextField     campoEmailRegistro;
    @FXML private PasswordField campoPasswordRegistro;
    @FXML private PasswordField campoConfirmarPassword;
    @FXML private Label         lblErrorRegistro;

    // Paneles
    @FXML private javafx.scene.layout.VBox panelLogin;
    @FXML private javafx.scene.layout.VBox panelRegistro;

    private final BCryptPasswordEncoder cifrador = new BCryptPasswordEncoder();
    private final LocalAuthService localAuthService = new LocalAuthService();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        mostrarLogin();
        configurarEnterLogin();
    }

    private void configurarEnterLogin() {
        campoPasswordLogin.setOnAction(e -> iniciarSesion());
    }

    @FXML
    public void mostrarLogin() {
        panelLogin.setVisible(true);
        panelLogin.setManaged(true);
        panelRegistro.setVisible(false);
        panelRegistro.setManaged(false);
        lblErrorLogin.setText("");
    }

    @FXML
    public void mostrarRegistro() {
        panelLogin.setVisible(false);
        panelLogin.setManaged(false);
        panelRegistro.setVisible(true);
        panelRegistro.setManaged(true);
        lblErrorRegistro.setText("");
    }

    @FXML
    public void iniciarSesion() {
        String email    = campoEmailLogin.getText().trim();
        String password = campoPasswordLogin.getText();

        if (email.isBlank() || password.isBlank()) {
            mostrarError(lblErrorLogin, "Introduce email y contrasena.");
            return;
        }

        // Modo demo: usuario hardcoded si no hay MongoDB
        if (autenticarDemo(email, password)) {
            SesionUsuario.getInstancia().iniciarSesion(crearUsuarioDemo(email));
            navegarAlDashboard();
            return;
        }

        try {
            Optional<Usuario> usuario = localAuthService.iniciarSesion(email, password);
            if (usuario.isPresent()) {
                SesionUsuario.getInstancia().iniciarSesion(usuario.get());
                navegarAlDashboard();
                return;
            }
        } catch (IOException e) {
            mostrarError(lblErrorLogin, "No se pudo leer la cuenta guardada.");
            return;
        }

        mostrarError(lblErrorLogin, "Email o contrasena incorrectos.");
    }

    @FXML
    public void registrarse() {
        String nombre    = campoNombreRegistro.getText().trim();
        String email     = campoEmailRegistro.getText().trim();
        String password  = campoPasswordRegistro.getText();
        String confirmar = campoConfirmarPassword.getText();

        if (nombre.isBlank() || email.isBlank() || password.isBlank()) {
            mostrarError(lblErrorRegistro, "Todos los campos son obligatorios.");
            return;
        }
        if (!email.contains("@") || !email.contains(".")) {
            mostrarError(lblErrorRegistro, "El formato del email no es valido.");
            return;
        }
        if (password.length() < 6) {
            mostrarError(lblErrorRegistro, "La contrasena debe tener al menos 6 caracteres.");
            return;
        }
        if (!password.equals(confirmar)) {
            mostrarError(lblErrorRegistro, "Las contrasenas no coinciden.");
            return;
        }

        try {
            Optional<Usuario> nuevo = localAuthService.registrar(nombre, email, password);
            if (nuevo.isEmpty()) {
                mostrarError(lblErrorRegistro, "Ya existe una cuenta con ese email.");
                return;
            }
            SesionUsuario.getInstancia().iniciarSesion(nuevo.get());
            navegarAlDashboard();
        } catch (IOException e) {
            mostrarError(lblErrorRegistro, "No se pudo guardar la cuenta.");
        }
    }

    private boolean autenticarDemo(String email, String password) {
        // Credenciales de demo para probar sin MongoDB
        return (email.equals("demo@baemimport.com") && password.equals("demo123"))
                || (email.equals("admin@baemimport.com") && password.equals("admin123"));
    }

    private Usuario crearUsuarioDemo(String email) {
        Usuario u = new Usuario();
        u.setId("demo-user-001");
        u.setNombre("Carlos Garcia");
        u.setEmail(email);
        u.setRol(email.contains("admin") ? "ADMIN" : "USUARIO");
        u.setActivo(true);
        u.setFechaRegistro(LocalDate.now());
        return u;
    }

    private void navegarAlDashboard() {
        try {
            Parent vista = FXMLLoader.load(getClass().getResource("/fxml/DashBoard.fxml"));
            Stage stage  = (Stage) campoEmailLogin.getScene().getWindow();
            stage.setScene(new Scene(vista, 1280, 800));
        } catch (Exception e) {
            mostrarError(lblErrorLogin, "Error al cargar el dashboard.");
            e.printStackTrace();
        }
    }

    private void mostrarError(Label label, String mensaje) {
        label.setText(mensaje);
    }
}
