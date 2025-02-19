package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.MicrodatosId;
import com.example.demo.entity.entityMicrodatos;

public interface repoMicrodatos extends JpaRepository<entityMicrodatos, MicrodatosId>{
    
}
