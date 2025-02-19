package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "mdea")
@IdClass(MdeaId.class) // Clave primaria compuesta
public class entityMdea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID autoincremental
    @Column(name = "id_mdea")
    private Long idMdea;

    @Id
    @Column(name = "id_var")
    private String idVar;

    @Column(name = "var_asig")
    private String varAsig;

    @Column(name = "compo")
    private String compo;

    @Column(name = "subcompo")
    private String subcompo;

    @Column(name = "topico")
    private String topico;

    @Column(name = "est_ambiental")
    private String estAmbiental;

    @Column(name = "estad_mdea")
    private String estadMdea;

    @Column(name = "niv_cont_mdea")
    private String nivContMdea;

    @Column(name = "coment_mdea")
    private String comentMdea;
}
