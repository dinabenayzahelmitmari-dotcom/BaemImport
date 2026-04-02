package com.repository;

import com.model.Documento;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentoRepository extends MongoRepository<Documento, String> {
    List<Documento> findByVehiculoId(String vehiculoId);
    List<Documento> findByUsuarioId(String usuarioId);
    List<Documento> findByEstado(String estado);
}
