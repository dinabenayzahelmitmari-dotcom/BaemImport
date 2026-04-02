package com;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 * Punto de entrada de la aplicacion BAEMIMPORT.
 * Carga la pantalla de Login como pantalla inicial.
 */
public class Main extends Application {

    private static Stage ventanaPrincipal;

    @Override
    public void start(Stage stage) throws Exception {
        ventanaPrincipal = stage;

        Parent raiz = FXMLLoader.load(getClass().getResource("/fxml/Login.fxml"));
        Scene escena = new Scene(raiz, 900, 600);

        stage.setTitle("BAEMIMPORT — Importacion de vehiculos desde Alemania");
        stage.setScene(escena);
        stage.setMinWidth(800);
        stage.setMinHeight(550);
        stage.show();
    }

    public static Stage getVentanaPrincipal() {
        return ventanaPrincipal;
    }

    public static void main(String[] args) {
        launch(args);
    }
}
