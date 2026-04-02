package com.repository;

import com.model.BusquedaVehiculo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusquedaVehiculoRepository extends MongoRepository<BusquedaVehiculo, String> {
    List<BusquedaVehiculo> findByUsuarioId(String usuarioId);
}
