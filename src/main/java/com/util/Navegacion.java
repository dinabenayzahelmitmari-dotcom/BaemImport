package com.util;

import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

/**
 * Metodos de navegacion entre pantallas.
 */
public class Navegacion {

    public static void ir(Stage stage, String rutaFxml) {
        try {
            Parent vista = FXMLLoader.load(Navegacion.class.getResource(rutaFxml));
            Scene escena = new Scene(vista);
            stage.setScene(escena);
        } catch (Exception e) {
            throw new RuntimeException("Error al cargar la vista: " + rutaFxml, e);
        }
    }

    public static void irConTamano(Stage stage, String rutaFxml, int ancho, int alto) {
        try {
            Parent vista = FXMLLoader.load(Navegacion.class.getResource(rutaFxml));
            stage.setScene(new Scene(vista, ancho, alto));
        } catch (Exception e) {
            throw new RuntimeException("Error al cargar la vista: " + rutaFxml, e);
        }
    }
}
