package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

@Document(collection = "vehiculos")
public class Vehiculo {

    @Id
    private String id;

    private String marca;
    private String modelo;
    private String vin;
    private int anio;
    private double precioCompra;
    private String vendedor;
    private String combustible;
    private int kilometros;
    private int potenciaCv;
    private double emisonesCo2;
    private String estado;      // Pendiente, En proceso, Completado
    private String faseActual;  // Alemania, Transporte, Espana
    private String usuarioId;
    private LocalDate fechaCreacion;
    private String notas;

    // Constructor sin id para crear desde formulario
    public Vehiculo(String marca, String modelo, String vin,
                    double precioCompra, String vendedor, String estado) {
        this.marca         = marca;
        this.modelo        = modelo;
        this.vin           = vin;
        this.precioCompra  = precioCompra;
        this.vendedor      = vendedor;
        this.estado        = estado;
        this.faseActual    = "Alemania";
        this.fechaCreacion = LocalDate.now();
    }

    public Vehiculo() {
    }

    public Vehiculo(String id, String marca, String modelo, String vin, int anio, double precioCompra, String vendedor,
                    String combustible, int kilometros, int potenciaCv, double emisonesCo2, String estado,
                    String faseActual, String usuarioId, LocalDate fechaCreacion, String notas) {
        this.id = id;
        this.marca = marca;
        this.modelo = modelo;
        this.vin = vin;
        this.anio = anio;
        this.precioCompra = precioCompra;
        this.vendedor = vendedor;
        this.combustible = combustible;
        this.kilometros = kilometros;
        this.potenciaCv = potenciaCv;
        this.emisonesCo2 = emisonesCo2;
        this.estado = estado;
        this.faseActual = faseActual;
        this.usuarioId = usuarioId;
        this.fechaCreacion = fechaCreacion;
        this.notas = notas;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMarca() { return marca; }
    public void setMarca(String marca) { this.marca = marca; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getVin() { return vin; }
    public void setVin(String vin) { this.vin = vin; }
    public int getAnio() { return anio; }
    public void setAnio(int anio) { this.anio = anio; }
    public double getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(double precioCompra) { this.precioCompra = precioCompra; }
    public String getVendedor() { return vendedor; }
    public void setVendedor(String vendedor) { this.vendedor = vendedor; }
    public String getCombustible() { return combustible; }
    public void setCombustible(String combustible) { this.combustible = combustible; }
    public int getKilometros() { return kilometros; }
    public void setKilometros(int kilometros) { this.kilometros = kilometros; }
    public int getPotenciaCv() { return potenciaCv; }
    public void setPotenciaCv(int potenciaCv) { this.potenciaCv = potenciaCv; }
    public double getEmisonesCo2() { return emisonesCo2; }
    public void setEmisonesCo2(double emisonesCo2) { this.emisonesCo2 = emisonesCo2; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getFaseActual() { return faseActual; }
    public void setFaseActual(String faseActual) { this.faseActual = faseActual; }
    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }
    public LocalDate getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDate fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
}
