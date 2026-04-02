package com.service;

import com.model.Vehiculo;
import com.repository.VehiculoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehiculoService {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    public Vehiculo guardar(Vehiculo vehiculo) {
        return vehiculoRepository.save(vehiculo);
    }

    public Optional<Vehiculo> obtenerPorId(String id) {
        return vehiculoRepository.findById(id);
    }

    public List<Vehiculo> obtenerPorUsuario(String usuarioId) {
        return vehiculoRepository.findByUsuarioId(usuarioId);
    }

    public List<Vehiculo> obtenerTodos() {
        return vehiculoRepository.findAll();
    }

    public void eliminar(String id) {
        vehiculoRepository.deleteById(id);
    }
}
