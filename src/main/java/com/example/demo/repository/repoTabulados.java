package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.entityTabulado;

public interface repoTabulados extends JpaRepository<entityTabulado, String>{
    
}
