package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "documentos")
public class Documento {

    @Id
    private String id;

    private String nombre;
    private String fase;
    private String tipo;
    private String vehiculo;
    private String fechaSubida;
    private String estado;
    private String rutaArchivo;
    private String vehiculoId;
    private String usuarioId;
    private long tamanoBytes;

    // Constructor sin id ni ruta para poblar tabla
    public Documento(String nombre, String fase, String tipo,
                     String vehiculo, String fechaSubida, String estado) {
        this.nombre      = nombre;
        this.fase        = fase;
        this.tipo        = tipo;
        this.vehiculo    = vehiculo;
        this.fechaSubida = fechaSubida;
        this.estado      = estado;
    }

    public Documento() {
    }

    public Documento(String id, String nombre, String fase, String tipo, String vehiculo, String fechaSubida,
                     String estado, String rutaArchivo, String vehiculoId, String usuarioId, long tamanoBytes) {
        this.id = id;
        this.nombre = nombre;
        this.fase = fase;
        this.tipo = tipo;
        this.vehiculo = vehiculo;
        this.fechaSubida = fechaSubida;
        this.estado = estado;
        this.rutaArchivo = rutaArchivo;
        this.vehiculoId = vehiculoId;
        this.usuarioId = usuarioId;
        this.tamanoBytes = tamanoBytes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getFase() { return fase; }
    public void setFase(String fase) { this.fase = fase; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getVehiculo() { return vehiculo; }
    public void setVehiculo(String vehiculo) { this.vehiculo = vehiculo; }
    public String getFechaSubida() { return fechaSubida; }
    public void setFechaSubida(String fechaSubida) { this.fechaSubida = fechaSubida; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getRutaArchivo() { return rutaArchivo; }
    public void setRutaArchivo(String rutaArchivo) { this.rutaArchivo = rutaArchivo; }
    public String getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(String vehiculoId) { this.vehiculoId = vehiculoId; }
    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }
    public long getTamanoBytes() { return tamanoBytes; }
    public void setTamanoBytes(long tamanoBytes) { this.tamanoBytes = tamanoBytes; }
}
