package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.OdsId;
import com.example.demo.entity.entityOds;

public interface repoOds extends JpaRepository<entityOds, OdsId>{
    
}
