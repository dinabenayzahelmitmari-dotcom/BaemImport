package com.service;

import com.model.ProcesoImportacion;
import com.repository.ProcesoImportacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProcesoImportacionService {

    @Autowired
    private ProcesoImportacionRepository procesoRepository;

    public ProcesoImportacion guardar(ProcesoImportacion proceso) {
        return procesoRepository.save(proceso);
    }

    public Optional<ProcesoImportacion> obtenerPorVehiculo(String vehiculoId) {
        return procesoRepository.findByVehiculoId(vehiculoId);
    }

    public List<ProcesoImportacion> obtenerPorUsuario(String usuarioId) {
        return procesoRepository.findByUsuarioId(usuarioId);
    }

    public int calcularPorcentaje(ProcesoImportacion p) {
        int total = 0, completados = 0;

        // Fase Alemania (6 items)
        total += 6;
        if (p.isFacturaSubida())        completados++;
        if (p.isTail1Subido())          completados++;
        if (p.isTail2Subido())          completados++;
        if (p.isCocSubido())            completados++;
        if (p.isSeguroMatriculaSubido()) completados++;
        if (p.isTuvSubido())            completados++;

        // Fase Transporte (2 items)
        total += 2;
        if (p.isSeguroTransporteSubido())   completados++;
        if (p.isContratoTransporteSubido()) completados++;

        // Fase Espana (3 items)
        total += 3;
        if (p.isItvSuperada())     completados++;
        if (p.isHaciendaPagada())  completados++;
        if ("Matriculado".equals(p.getEstadoDgt())) completados++;

        return (int) Math.round((completados * 100.0) / total);
    }
}
