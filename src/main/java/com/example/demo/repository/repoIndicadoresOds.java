package com.example.demo.repository;

import com.example.demo.entity.entityIndicadoresOds;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.IndicadorId;
	
public interface repoIndicadoresOds extends JpaRepository<entityIndicadoresOds, IndicadorId> {
	
}