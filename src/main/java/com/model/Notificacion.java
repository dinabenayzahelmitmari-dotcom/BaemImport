package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notificaciones")
public class Notificacion {

    @Id
    private String id;

    private String titulo;
    private String mensaje;
    private String tipo;       // INFO, AVISO, ERROR, EXITO
    private String usuarioId;
    private boolean leida;
    private LocalDateTime fechaCreacion;

    public Notificacion(String titulo, String mensaje, String tipo, String usuarioId) {
        this.titulo        = titulo;
        this.mensaje       = mensaje;
        this.tipo          = tipo;
        this.usuarioId     = usuarioId;
        this.leida         = false;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Notificacion() {
    }

    public Notificacion(String id, String titulo, String mensaje, String tipo, String usuarioId, boolean leida,
                        LocalDateTime fechaCreacion) {
        this.id = id;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.usuarioId = usuarioId;
        this.leida = leida;
        this.fechaCreacion = fechaCreacion;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }
    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
