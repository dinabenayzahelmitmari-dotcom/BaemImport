package com.repository;

import com.model.Notificacion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends MongoRepository<Notificacion, String> {
    List<Notificacion> findByUsuarioIdAndLeidaFalse(String usuarioId);
    List<Notificacion> findByUsuarioId(String usuarioId);
}
