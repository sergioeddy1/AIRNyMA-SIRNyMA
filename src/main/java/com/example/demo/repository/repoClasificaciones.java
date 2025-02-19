package com.example.demo.repository;

import com.example.demo.entity.entityClasificaciones;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface repoClasificaciones extends JpaRepository<entityClasificaciones, Long>{
    
}
