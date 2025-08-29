package com.example.demo.repository;

import com.example.demo.entity.EntityIndicadores;
import org.springframework.data.jpa.repository.JpaRepository;

public interface repoIndicadores extends JpaRepository<EntityIndicadores, Long> {
    
}