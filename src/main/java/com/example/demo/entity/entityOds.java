package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "ods")
@IdClass(OdsId.class)
public class entityOds {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID autoincremental
    @Column(name = "id_ods")
    private Long idOds;

    @Id
    @Column(name = "id_var")
    private String idVar;

    @Column(name = "var_asig")
    private String varAsig;

    @Column(name = "ods")
    private String ods;

    @Column(name = "meta")
    private String meta;

    @Column(name = "indicador")
    private String indicador;

    @Column(name = "niv_cont_ods")
    private String nivContOds;

    @Column(name = "coment_ods")
    private String comentOds;
}
