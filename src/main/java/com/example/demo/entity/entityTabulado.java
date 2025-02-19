package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "tabulado")
public class entityTabulado {
    @Id
    @Column(name = "id_tab")
    private String idTab; // Como es TEXT, lo manejamos como String.

    @Column(name = "titulo_tab")
    private String tituloTab;

    @Column(name = "tipo_tab")
    private String tipoTab;

    @Column(name = "num_tab")
    private String numTab;

    @Column(name = "liga_tab")
    private String ligaTab;

    @Column(name = "liga_desc_tab")
    private String ligaDescTab;

    @Column(name = "cobertura")
    private String cobertura;

    @Column(name = "por_1")
    private String por1;

    @Column(name = "por_2")
    private String por2;

    @Column(name = "por_3")
    private String por3;

    @Column(name = "por_4")
    private String por4;

    @Column(name = "segun_1")
    private String segun1;

    @Column(name = "segun_2")
    private String segun2;

    @Column(name = "segun_3")
    private String segun3;

    @Column(name = "coment_tab")
    private String comentTab;
}
