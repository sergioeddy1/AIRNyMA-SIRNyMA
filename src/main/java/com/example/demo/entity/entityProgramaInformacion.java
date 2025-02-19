package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "programa_informacion")
@Getter
@Setter
public class entityProgramaInformacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPi;

    private String pi;
    private String subsInf;
    private String uniAdmin;
    private String pp_asociado;
    private String comentPi;

   

}
