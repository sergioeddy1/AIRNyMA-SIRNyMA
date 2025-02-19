package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "microdatos")
@IdClass(MicrodatosId.class)
public class entityMicrodatos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID autoincremental
    @Column(name = "id_md")
    private Long idMd;

    @Id
    @Column(name = "id_var")
    private String idVar;

    @Column(name = "liga_micro")
    private String ligaMicro;

    @Column(name = "nom_dd")
    private String nomDd;

    @Column(name = "liga_dd")
    private String ligaDd;

    @Column(name = "nom_tabla")
    private String nomTabla;

    @Column(name = "nom_campo")
    private String nomCampo;

    @Column(name = "coment_micro")
    private String comentMicro;
}
