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
@Table(name = "pull_ods_meta") // ajusta si tu tabla tiene otro nombre
@IdClass(MetaId.class)
public class entityMetaOds {

    @Id
    @Column(name = "id_objetivo", nullable = false)
    private Integer id_objetivo;

    @Id
    @Column(name = "id_meta", columnDefinition = "text", nullable = false)
    private String id_meta;

    @Column(name = "name_meta", columnDefinition = "text")
    private String name_meta; // campo adicional si existe; quítalo si no aplica
}