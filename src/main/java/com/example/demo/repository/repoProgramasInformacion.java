package com.example.demo.repository;

import com.example.demo.entity.entityProgramaInformacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface repoProgramasInformacion extends JpaRepository<entityProgramaInformacion, Long>{
    
}
