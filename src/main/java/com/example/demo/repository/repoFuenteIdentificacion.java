package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entity.entityFuenteIdentificacion;

@Repository
public interface repoFuenteIdentificacion extends JpaRepository<entityFuenteIdentificacion, Long>{
    
}
