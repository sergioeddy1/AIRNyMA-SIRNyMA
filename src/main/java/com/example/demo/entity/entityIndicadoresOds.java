package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "pull_ods_indicador")
@IdClass(IndicadorId.class)
public class entityIndicadoresOds {

    @Id
    @Column(name = "id_objetivo", nullable = false)
    private Integer id_objetivo;

    @Id
    @Column(name = "id_meta", columnDefinition = "text", nullable = false)
    private String id_meta;

    @Id
    @Column(name = "id_indicador", nullable = false)
    private Integer id_indicador;

    @Column(name = "name_indicador", columnDefinition = "text")
    private String name_indicador;
}