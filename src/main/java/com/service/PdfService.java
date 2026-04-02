package com.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.itextpdf.text.pdf.draw.LineSeparator;
import com.model.Vehiculo;
import com.model.ProcesoImportacion;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;

/**
 * Servicio para generacion de informes en PDF.
 */
@Service
public class PdfService {

    private static final BaseColor COLOR_PRIMARIO   = new BaseColor(79, 110, 247);
    private static final BaseColor COLOR_OSCURO     = new BaseColor(15, 17, 23);
    private static final BaseColor COLOR_SUPERFICIE = new BaseColor(26, 29, 39);
    private static final BaseColor COLOR_TEXTO      = new BaseColor(232, 234, 240);
    private static final BaseColor COLOR_VERDE      = new BaseColor(34, 197, 94);
    private static final BaseColor COLOR_ROJO       = new BaseColor(239, 68, 68);
    private static final BaseColor COLOR_AMARILLO   = new BaseColor(245, 158, 11);

    /**
     * Genera un informe PDF completo de una importacion.
     */
    public File generarInformeImportacion(Vehiculo vehiculo,
                                          ProcesoImportacion proceso,
                                          File destino) throws Exception {
        Document doc = new Document(PageSize.A4, 50, 50, 60, 50);
        PdfWriter writer = PdfWriter.getInstance(doc, new FileOutputStream(destino));

        doc.open();

        agregarCabecera(doc, writer);
        agregarTitulo(doc, "Informe de Importacion");
        agregarDatosVehiculo(doc, vehiculo);

        if (proceso != null) {
            agregarProgreso(doc, proceso);
        }

        agregarPiePagina(doc);
        doc.close();

        return destino;
    }

    /**
     * Genera un informe PDF de los documentos de una importacion.
     */
    public File generarInformeDocumentos(Vehiculo vehiculo, File destino) throws Exception {
        Document doc = new Document(PageSize.A4, 50, 50, 60, 50);
        PdfWriter.getInstance(doc, new FileOutputStream(destino));

        doc.open();
        agregarTitulo(doc, "Centro de Documentos — " + vehiculo.getMarca()
                + " " + vehiculo.getModelo());
        agregarPiePagina(doc);
        doc.close();

        return destino;
    }

    /**
     * Genera el calculo de impuestos en PDF.
     */
    public File generarInformeImpuestos(Vehiculo vehiculo,
                                        double precioCompra,
                                        double emisiones,
                                        double impMatriculacion,
                                        double impCirculacion,
                                        File destino) throws Exception {
        Document doc = new Document(PageSize.A4, 50, 50, 60, 50);
        PdfWriter.getInstance(doc, new FileOutputStream(destino));

        doc.open();

        agregarTitulo(doc, "Calculo de Impuestos — Importacion desde Alemania");

        Font fuenteSeccion = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD,
                new BaseColor(COLOR_PRIMARIO.getRed(),
                        COLOR_PRIMARIO.getGreen(),
                        COLOR_PRIMARIO.getBlue()));
        Font fuenteNormal = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL);

        doc.add(new Paragraph("Vehiculo: " + vehiculo.getMarca() + " "
                + vehiculo.getModelo(), fuenteSeccion));
        doc.add(Chunk.NEWLINE);
        doc.add(new Paragraph("Precio de compra: " + String.format("%.2f €", precioCompra), fuenteNormal));
        doc.add(new Paragraph("Emisiones CO2: " + emisiones + " g/km", fuenteNormal));
        doc.add(Chunk.NEWLINE);
        doc.add(new Paragraph("Impuesto de Matriculacion: " + String.format("%.2f €", impMatriculacion), fuenteNormal));
        doc.add(new Paragraph("Impuesto de Circulacion: " + String.format("%.2f €", impCirculacion), fuenteNormal));
        doc.add(new Paragraph("TOTAL IMPUESTOS: " + String.format("%.2f €", impMatriculacion + impCirculacion),
                new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD)));
        doc.add(Chunk.NEWLINE);
        doc.add(new Paragraph("Fecha de calculo: " + LocalDate.now(), fuenteNormal));

        agregarPiePagina(doc);
        doc.close();

        return destino;
    }

    // Metodos privados de construccion del PDF

    private void agregarCabecera(Document doc, PdfWriter writer) throws DocumentException {
        Font fuenteLogo = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, COLOR_PRIMARIO);
        Paragraph logo = new Paragraph("BAEMIMPORT", fuenteLogo);
        logo.setAlignment(Element.ALIGN_LEFT);
        doc.add(logo);

        Font fuenteSub = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.GRAY);
        Paragraph sub = new Paragraph("Importacion de vehiculos desde Alemania", fuenteSub);
        doc.add(sub);

        doc.add(new LineSeparator());
        doc.add(Chunk.NEWLINE);
    }

    private void agregarTitulo(Document doc, String titulo) throws DocumentException {
        Font fuente = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
        Paragraph p = new Paragraph(titulo, fuente);
        p.setSpacingAfter(12);
        doc.add(p);
    }

    private void agregarDatosVehiculo(Document doc, Vehiculo v) throws DocumentException {
        if (v == null) return;
        Font fuenteSeccion = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, COLOR_PRIMARIO);
        Font fuenteNormal  = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL);

        doc.add(new Paragraph("Datos del Vehiculo", fuenteSeccion));
        doc.add(new Paragraph("Marca / Modelo: " + v.getMarca() + " " + v.getModelo(), fuenteNormal));
        doc.add(new Paragraph("VIN: " + v.getVin(), fuenteNormal));
        if (v.getAnio() > 0)
            doc.add(new Paragraph("Ano: " + v.getAnio(), fuenteNormal));
        doc.add(new Paragraph("Precio de compra: " + String.format("%.2f €", v.getPrecioCompra()), fuenteNormal));
        if (v.getVendedor() != null && !v.getVendedor().isBlank())
            doc.add(new Paragraph("Vendedor: " + v.getVendedor(), fuenteNormal));
        doc.add(new Paragraph("Estado: " + v.getEstado(), fuenteNormal));
        doc.add(new Paragraph("Fecha de creacion: " + v.getFechaCreacion(), fuenteNormal));
        doc.add(Chunk.NEWLINE);
    }

    private void agregarProgreso(Document doc, ProcesoImportacion p) throws DocumentException {
        Font fuenteSeccion = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, COLOR_PRIMARIO);
        Font fuenteNormal  = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL);

        doc.add(new Paragraph("Estado del Proceso", fuenteSeccion));
        doc.add(new Paragraph("Progreso global: " + p.getPorcentajeCompletado() + "%", fuenteNormal));
        doc.add(Chunk.NEWLINE);

        doc.add(new Paragraph("Fase Alemania", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        doc.add(new Paragraph("  Factura de compra: " + (p.isFacturaSubida() ? "Subida" : "Pendiente"), fuenteNormal));
        doc.add(new Paragraph("  Tail 1: " + (p.isTail1Subido() ? "Subido" : "Pendiente"), fuenteNormal));
        doc.add(new Paragraph("  Tail 2: " + (p.isTail2Subido() ? "Subido" : "Pendiente"), fuenteNormal));
        doc.add(new Paragraph("  COC: " + (p.isCocSubido() ? "Subido" : "Pendiente"), fuenteNormal));
        doc.add(new Paragraph("  TUV: " + (p.isTuvSubido() ? "Subido" : "Pendiente"), fuenteNormal));
        doc.add(Chunk.NEWLINE);

        doc.add(new Paragraph("Fase Transporte", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        doc.add(new Paragraph("  Tipo: " + (p.getTipoTransporte() != null ? p.getTipoTransporte() : "Sin definir"), fuenteNormal));
        doc.add(new Paragraph("  Seguro: " + (p.isSeguroTransporteSubido() ? "Subido" : "Pendiente"), fuenteNormal));
        doc.add(Chunk.NEWLINE);

        doc.add(new Paragraph("Fase Espana", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD)));
        doc.add(new Paragraph("  ITV superada: " + (p.isItvSuperada() ? "Si" : "No"), fuenteNormal));
        doc.add(new Paragraph("  Hacienda pagada: " + (p.isHaciendaPagada() ? "Si" : "No"), fuenteNormal));
        doc.add(new Paragraph("  Estado DGT: " + (p.getEstadoDgt() != null ? p.getEstadoDgt() : "Sin iniciar"), fuenteNormal));
        doc.add(Chunk.NEWLINE);
    }

    private void agregarPiePagina(Document doc) throws DocumentException {
        Font fuente = new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC, BaseColor.GRAY);
        doc.add(new LineSeparator());
        Paragraph pie = new Paragraph("Generado por BAEMIMPORT v2.0 — " + LocalDate.now(), fuente);
        pie.setAlignment(Element.ALIGN_CENTER);
        doc.add(pie);
    }
}
