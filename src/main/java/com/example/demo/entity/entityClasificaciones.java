package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "clasificaciones")
@Getter
@Setter
public class entityClasificaciones {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Para `id_clasifica` que es SERIAL
    private Long idClasifica;

    
    
    private String idPp;
    private String idVar;
    private String varAsig;
    private String clasificaciones;
    private String comentClas;
}
