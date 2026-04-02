package com.service;

import com.model.Documento;
import com.repository.DocumentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocumentoService {

    @Autowired
    private DocumentoRepository documentoRepository;

    public Documento guardar(Documento documento) {
        return documentoRepository.save(documento);
    }

    public Optional<Documento> obtenerPorId(String id) {
        return documentoRepository.findById(id);
    }

    public List<Documento> obtenerPorVehiculo(String vehiculoId) {
        return documentoRepository.findByVehiculoId(vehiculoId);
    }

    public List<Documento> obtenerTodos() {
        return documentoRepository.findAll();
    }

    public void eliminar(String id) {
        documentoRepository.deleteById(id);
    }
}
