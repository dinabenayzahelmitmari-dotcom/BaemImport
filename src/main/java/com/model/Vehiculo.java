package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "vehiculos")
public class Vehiculo {

    @Id
    private String id;

    private String marca;
    private String modelo;
    private String vin;
    private double precioCompra;
    private String vendedor;
    private String estado;

    public Vehiculo() {
    }

    public Vehiculo(String id, String marca, String modelo, String vin,
                    double precioCompra, String vendedor, String estado) {
        this.id = id;
        this.marca = marca;
        this.modelo = modelo;
        this.vin = vin;
        this.precioCompra = precioCompra;
        this.vendedor = vendedor;
        this.estado = estado;
    }

    public Vehiculo(String marca, String modelo, String vin,
                    double precioCompra, String vendedor, String estado) {
        this.marca = marca;
        this.modelo = modelo;
        this.vin = vin;
        this.precioCompra = precioCompra;
        this.vendedor = vendedor;
        this.estado = estado;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public String getVin() {
        return vin;
    }

    public void setVin(String vin) {
        this.vin = vin;
    }

    public double getPrecioCompra() {
        return precioCompra;
    }

    public void setPrecioCompra(double precioCompra) {
        this.precioCompra = precioCompra;
    }

    public String getVendedor() {
        return vendedor;
    }

    public void setVendedor(String vendedor) {
        this.vendedor = vendedor;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}
