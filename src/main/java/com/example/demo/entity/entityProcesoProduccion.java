package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "proceso_produccion")
@Getter
@Setter
public class entityProcesoProduccion {
    @Id
    private String idPp;
    private String pi;
    private String pp;
    private String dgaRespPp;
    private String perioProd;
    private String vigInicial;
    private String vigFinal;
    private String metGenInf;
    private String gradoMadur;
    private String perPubResul;
    private String estatus;
    private String descPp;
    private String comentPp;
    private String responCaptura;

  
}
