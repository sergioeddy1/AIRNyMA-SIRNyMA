package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "fuente_identificacion")
@Getter
@Setter
public class entityFuenteIdentificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // SERIAL en PostgreSQL
    private Long idFi;

    private String idPp;
    private String fuenteIden;
    private String ligaPrinc;
    private String ligaFuente;
    private String anioEvento;
    private String esqConcep;
    private String comentFiy;
}
