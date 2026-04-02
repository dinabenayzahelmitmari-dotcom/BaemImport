package com.repository;

import com.model.ProcesoImportacion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcesoImportacionRepository extends MongoRepository<ProcesoImportacion, String> {
    Optional<ProcesoImportacion> findByVehiculoId(String vehiculoId);
    List<ProcesoImportacion> findByUsuarioId(String usuarioId);
}
