package com;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 * Punto de entrada de la aplicación BAEMIMPORT.
 * Carga el Dashboard como pantalla inicial.
 */
public class Main extends Application {

    @Override
    public void start(Stage stage) throws Exception {
        // Carga la pantalla inicial: Dashboard
        Parent raiz = FXMLLoader.load(getClass().getResource("/fxml/DashBoard.fxml"));

        Scene escena = new Scene(raiz, 1280, 800);

        stage.setTitle("BAEMIMPORT — Importación de vehículos desde Alemania");
        stage.setScene(escena);
        stage.setMinWidth(900);
        stage.setMinHeight(600);
        stage.show();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
