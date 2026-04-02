package com.service;

import com.model.Notificacion;
import com.repository.NotificacionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificacionService {

    @Autowired
    private NotificacionRepository notificacionRepository;

    public Notificacion crear(String titulo, String mensaje, String tipo, String usuarioId) {
        Notificacion n = new Notificacion(titulo, mensaje, tipo, usuarioId);
        return notificacionRepository.save(n);
    }

    public List<Notificacion> obtenerNoLeidas(String usuarioId) {
        return notificacionRepository.findByUsuarioIdAndLeidaFalse(usuarioId);
    }

    public List<Notificacion> obtenerTodas(String usuarioId) {
        return notificacionRepository.findByUsuarioId(usuarioId);
    }

    public void marcarLeida(String id) {
        notificacionRepository.findById(id).ifPresent(n -> {
            n.setLeida(true);
            notificacionRepository.save(n);
        });
    }
}
