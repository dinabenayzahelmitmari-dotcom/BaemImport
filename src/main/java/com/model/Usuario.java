package com.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDate;

@Document(collection = "usuarios")
public class Usuario {

    @Id
    private String id;

    private String nombre;
    private String apellidos;

    @Indexed(unique = true)
    private String email;

    private String passwordHash;
    private String telefono;
    private LocalDate fechaNacimiento;
    private String direccion;
    private String ciudad;
    private String codigoPostal;
    private String provincia;
    private String banco;
    private String iban;
    private String delegacionHacienda;
    private String rol; // ADMIN, USUARIO
    private boolean activo;
    private LocalDate fechaRegistro;

    // Constructor para registro rapido
    public Usuario(String nombre, String email, String passwordHash) {
        this.nombre        = nombre;
        this.email         = email;
        this.passwordHash  = passwordHash;
        this.rol           = "USUARIO";
        this.activo        = true;
        this.fechaRegistro = LocalDate.now();
    }

    public Usuario() {
    }

    public Usuario(String id, String nombre, String apellidos, String email, String passwordHash, String telefono,
                   LocalDate fechaNacimiento, String direccion, String ciudad, String codigoPostal, String provincia,
                   String banco, String iban, String delegacionHacienda, String rol, boolean activo,
                   LocalDate fechaRegistro) {
        this.id = id;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.email = email;
        this.passwordHash = passwordHash;
        this.telefono = telefono;
        this.fechaNacimiento = fechaNacimiento;
        this.direccion = direccion;
        this.ciudad = ciudad;
        this.codigoPostal = codigoPostal;
        this.provincia = provincia;
        this.banco = banco;
        this.iban = iban;
        this.delegacionHacienda = delegacionHacienda;
        this.rol = rol;
        this.activo = activo;
        this.fechaRegistro = fechaRegistro;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
    public String getProvincia() { return provincia; }
    public void setProvincia(String provincia) { this.provincia = provincia; }
    public String getBanco() { return banco; }
    public void setBanco(String banco) { this.banco = banco; }
    public String getIban() { return iban; }
    public void setIban(String iban) { this.iban = iban; }
    public String getDelegacionHacienda() { return delegacionHacienda; }
    public void setDelegacionHacienda(String delegacionHacienda) { this.delegacionHacienda = delegacionHacienda; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }
}
