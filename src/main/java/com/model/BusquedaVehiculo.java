package com.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "busquedas")
public class BusquedaVehiculo {

    @Id
    private String id;

    private String usuarioId;
    private String marca;
    private String modelo;
    private Integer anioMinimo;
    private Double precioMaximo;
    private Integer kmMaximos;
    private Integer potenciaMinima;
    private List<String> combustibles;
    private List<String> extras;
    private String region;
    private String notas;
}
