package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.entity.entityAIRNyMAVariableRelaccion;
import com.example.demo.repository.repoAIRNyMAVariablesRelaciones;

@Service
public class serviceAIRNyMAVariablesRelacion {
    private final repoAIRNyMAVariablesRelaciones repository;

    public serviceAIRNyMAVariablesRelacion(repoAIRNyMAVariablesRelaciones repository){
        this.repository = repository;
    }

    public List<entityAIRNyMAVariableRelaccion> getAllVariables() {
        return repository.findAll();
    }
}
