package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
public class entityUsuarios {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Para `id_clasifica` que es SERIAL

    
    private String id;
    private String nombre;
    private String contrasena;
}
