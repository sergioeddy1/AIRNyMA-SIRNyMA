package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.entityMdea;
import com.example.demo.entity.MdeaId;


public interface repoMdea extends JpaRepository<entityMdea, MdeaId>{
    
}
