package com.service;

import com.model.Usuario;
import com.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Servicio de autenticacion: registro e inicio de sesion.
 */
@Service
public class AutenticacionService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    private final BCryptPasswordEncoder cifrador = new BCryptPasswordEncoder();

    /**
     * Registra un nuevo usuario. Devuelve el usuario creado o null si el email ya existe.
     */
    public Usuario registrar(String nombre, String email, String password) {
        if (usuarioRepository.existsByEmail(email)) {
            return null; // email ya registrado
        }
        String hash = cifrador.encode(password);
        Usuario nuevo = new Usuario(nombre, email, hash);
        usuarioRepository.save(nuevo);
        emailService.enviarBienvenida(email, nombre);
        return nuevo;
    }

    /**
     * Valida credenciales y devuelve el usuario si son correctas.
     */
    public Optional<Usuario> iniciarSesion(String email, String password) {
        Optional<Usuario> usuario = usuarioRepository.findByEmail(email);
        if (usuario.isPresent() && cifrador.matches(password, usuario.get().getPasswordHash())) {
            return usuario;
        }
        return Optional.empty();
    }

    /**
     * Cambia la contrasena de un usuario.
     */
    public boolean cambiarPassword(String usuarioId, String passwordActual, String passwordNueva) {
        Optional<Usuario> optUsuario = usuarioRepository.findById(usuarioId);
        if (optUsuario.isEmpty()) return false;
        Usuario u = optUsuario.get();
        if (!cifrador.matches(passwordActual, u.getPasswordHash())) return false;
        u.setPasswordHash(cifrador.encode(passwordNueva));
        usuarioRepository.save(u);
        return true;
    }
}
