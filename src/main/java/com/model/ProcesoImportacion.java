package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "procesos")
public class ProcesoImportacion {

    @Id
    private String id;

    private String vehiculoId;
    private String usuarioId;

    // Fase Alemania
    private boolean facturaSubida;
    private boolean tail1Subido;
    private boolean tail2Subido;
    private boolean cocSubido;
    private boolean seguroMatriculaSubido;
    private boolean tuvSubido;
    private String tipoMatricula; // Roja, Amarilla

    // Fase Transporte
    private String tipoTransporte; // Conduccion, Camion
    private String empresaTransporte;
    private String fechaSalida;
    private String fechaLlegada;
    private boolean seguroTransporteSubido;
    private boolean contratoTransporteSubido;

    // Fase Espana
    private String fechaCitaItv;
    private String provinciaItv;
    private boolean fichaTecnicaSubida;
    private boolean itvSuperada;
    private boolean haciendaPagada;
    private String estadoDgt;
    private boolean docsDgtSubidos;
    private double impuestoMatriculacion;
    private double impuestoCirculacion;

    private String estado; // En proceso, Completado
    private int porcentajeCompletado;

    public ProcesoImportacion() {
    }

    public ProcesoImportacion(String id, String vehiculoId, String usuarioId, boolean facturaSubida, boolean tail1Subido,
                              boolean tail2Subido, boolean cocSubido, boolean seguroMatriculaSubido,
                              boolean tuvSubido, String tipoMatricula, String tipoTransporte,
                              String empresaTransporte, String fechaSalida, String fechaLlegada,
                              boolean seguroTransporteSubido, boolean contratoTransporteSubido,
                              String fechaCitaItv, String provinciaItv, boolean fichaTecnicaSubida,
                              boolean itvSuperada, boolean haciendaPagada, String estadoDgt,
                              boolean docsDgtSubidos, double impuestoMatriculacion, double impuestoCirculacion,
                              String estado, int porcentajeCompletado) {
        this.id = id;
        this.vehiculoId = vehiculoId;
        this.usuarioId = usuarioId;
        this.facturaSubida = facturaSubida;
        this.tail1Subido = tail1Subido;
        this.tail2Subido = tail2Subido;
        this.cocSubido = cocSubido;
        this.seguroMatriculaSubido = seguroMatriculaSubido;
        this.tuvSubido = tuvSubido;
        this.tipoMatricula = tipoMatricula;
        this.tipoTransporte = tipoTransporte;
        this.empresaTransporte = empresaTransporte;
        this.fechaSalida = fechaSalida;
        this.fechaLlegada = fechaLlegada;
        this.seguroTransporteSubido = seguroTransporteSubido;
        this.contratoTransporteSubido = contratoTransporteSubido;
        this.fechaCitaItv = fechaCitaItv;
        this.provinciaItv = provinciaItv;
        this.fichaTecnicaSubida = fichaTecnicaSubida;
        this.itvSuperada = itvSuperada;
        this.haciendaPagada = haciendaPagada;
        this.estadoDgt = estadoDgt;
        this.docsDgtSubidos = docsDgtSubidos;
        this.impuestoMatriculacion = impuestoMatriculacion;
        this.impuestoCirculacion = impuestoCirculacion;
        this.estado = estado;
        this.porcentajeCompletado = porcentajeCompletado;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(String vehiculoId) { this.vehiculoId = vehiculoId; }
    public String getUsuarioId() { return usuarioId; }
    public void setUsuarioId(String usuarioId) { this.usuarioId = usuarioId; }
    public boolean isFacturaSubida() { return facturaSubida; }
    public void setFacturaSubida(boolean facturaSubida) { this.facturaSubida = facturaSubida; }
    public boolean isTail1Subido() { return tail1Subido; }
    public void setTail1Subido(boolean tail1Subido) { this.tail1Subido = tail1Subido; }
    public boolean isTail2Subido() { return tail2Subido; }
    public void setTail2Subido(boolean tail2Subido) { this.tail2Subido = tail2Subido; }
    public boolean isCocSubido() { return cocSubido; }
    public void setCocSubido(boolean cocSubido) { this.cocSubido = cocSubido; }
    public boolean isSeguroMatriculaSubido() { return seguroMatriculaSubido; }
    public void setSeguroMatriculaSubido(boolean seguroMatriculaSubido) { this.seguroMatriculaSubido = seguroMatriculaSubido; }
    public boolean isTuvSubido() { return tuvSubido; }
    public void setTuvSubido(boolean tuvSubido) { this.tuvSubido = tuvSubido; }
    public String getTipoMatricula() { return tipoMatricula; }
    public void setTipoMatricula(String tipoMatricula) { this.tipoMatricula = tipoMatricula; }
    public String getTipoTransporte() { return tipoTransporte; }
    public void setTipoTransporte(String tipoTransporte) { this.tipoTransporte = tipoTransporte; }
    public String getEmpresaTransporte() { return empresaTransporte; }
    public void setEmpresaTransporte(String empresaTransporte) { this.empresaTransporte = empresaTransporte; }
    public String getFechaSalida() { return fechaSalida; }
    public void setFechaSalida(String fechaSalida) { this.fechaSalida = fechaSalida; }
    public String getFechaLlegada() { return fechaLlegada; }
    public void setFechaLlegada(String fechaLlegada) { this.fechaLlegada = fechaLlegada; }
    public boolean isSeguroTransporteSubido() { return seguroTransporteSubido; }
    public void setSeguroTransporteSubido(boolean seguroTransporteSubido) { this.seguroTransporteSubido = seguroTransporteSubido; }
    public boolean isContratoTransporteSubido() { return contratoTransporteSubido; }
    public void setContratoTransporteSubido(boolean contratoTransporteSubido) { this.contratoTransporteSubido = contratoTransporteSubido; }
    public String getFechaCitaItv() { return fechaCitaItv; }
    public void setFechaCitaItv(String fechaCitaItv) { this.fechaCitaItv = fechaCitaItv; }
    public String getProvinciaItv() { return provinciaItv; }
    public void setProvinciaItv(String provinciaItv) { this.provinciaItv = provinciaItv; }
    public boolean isFichaTecnicaSubida() { return fichaTecnicaSubida; }
    public void setFichaTecnicaSubida(boolean fichaTecnicaSubida) { this.fichaTecnicaSubida = fichaTecnicaSubida; }
    public boolean isItvSuperada() { return itvSuperada; }
    public void setItvSuperada(boolean itvSuperada) { this.itvSuperada = itvSuperada; }
    public boolean isHaciendaPagada() { return haciendaPagada; }
    public void setHaciendaPagada(boolean haciendaPagada) { this.haciendaPagada = haciendaPagada; }
    public String getEstadoDgt() { return estadoDgt; }
    public void setEstadoDgt(String estadoDgt) { this.estadoDgt = estadoDgt; }
    public boolean isDocsDgtSubidos() { return docsDgtSubidos; }
    public void setDocsDgtSubidos(boolean docsDgtSubidos) { this.docsDgtSubidos = docsDgtSubidos; }
    public double getImpuestoMatriculacion() { return impuestoMatriculacion; }
    public void setImpuestoMatriculacion(double impuestoMatriculacion) { this.impuestoMatriculacion = impuestoMatriculacion; }
    public double getImpuestoCirculacion() { return impuestoCirculacion; }
    public void setImpuestoCirculacion(double impuestoCirculacion) { this.impuestoCirculacion = impuestoCirculacion; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public int getPorcentajeCompletado() { return porcentajeCompletado; }
    public void setPorcentajeCompletado(int porcentajeCompletado) { this.porcentajeCompletado = porcentajeCompletado; }
}
