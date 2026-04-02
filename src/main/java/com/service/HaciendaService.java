package com.service;

import org.springframework.stereotype.Service;

/**
 * Calculo del Impuesto de Matriculacion segun tramos de CO2 (2024).
 */
@Service
public class HaciendaService {

    public double calcularImpuestoMatriculacion(double precioCompra, double emisionesCo2) {
        double tipo;
        if      (emisionesCo2 < 120) tipo = 0.0;
        else if (emisionesCo2 < 160) tipo = 4.75;
        else if (emisionesCo2 < 200) tipo = 9.75;
        else                         tipo = 14.75;
        return precioCompra * (tipo / 100.0);
    }

    public double calcularImpuestoCirculacion(double emisionesCo2) {
        if      (emisionesCo2 < 120) return 0;
        else if (emisionesCo2 < 160) return 62;
        else if (emisionesCo2 < 200) return 125;
        else                         return 185;
    }

    public String obtenerTipoGravamen(double emisionesCo2) {
        if      (emisionesCo2 < 120) return "0% (menos de 120 g/km)";
        else if (emisionesCo2 < 160) return "4,75% (120-160 g/km)";
        else if (emisionesCo2 < 200) return "9,75% (160-200 g/km)";
        else                         return "14,75% (mas de 200 g/km)";
    }
}
