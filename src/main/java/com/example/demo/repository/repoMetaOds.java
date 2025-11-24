package com.example.demo.repository;

import com.example.demo.entity.MetaId;
import com.example.demo.entity.entityMetaOds;
import org.springframework.data.jpa.repository.JpaRepository;


public interface repoMetaOds extends JpaRepository<entityMetaOds, MetaId> {
	
}