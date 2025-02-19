package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "eventos")
public class entityEventos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long idEvento;

    @Column(name = "id_pp")
    private String idPp;

    @Column(name = "id_var")
    private String idVar;

    @Column(name = "var_asig")
    private String varAsig;

    @Column(name = "evento")
    private String evento;

    @Column(name = "fuente_iden")
    private String fuenteIden;

    @Column(name = "var_fuente")
    private String varFuente;

    @Column(name = "cod_var")
    private String codVar;

    @Column(name = "coment_even")
    private String comentEven;
}
