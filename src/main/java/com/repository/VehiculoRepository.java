package com.repository;

import com.model.Vehiculo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiculoRepository extends MongoRepository<Vehiculo, String> {
    List<Vehiculo> findByUsuarioId(String usuarioId);
    List<Vehiculo> findByEstado(String estado);
}
