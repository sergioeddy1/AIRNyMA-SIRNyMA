package com.example.demo.controllers;

import com.example.demo.entity.entityAIRNyMAVariableRelaccion;
import com.example.demo.service.serviceAIRNyMAVariablesRelacion;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/variablesAll")
public class VariableRelacionesController {
    private final serviceAIRNyMAVariablesRelacion service;

    public VariableRelacionesController(serviceAIRNyMAVariablesRelacion service) {
        this.service = service;
    }

   @GetMapping
   public List<entityAIRNyMAVariableRelaccion> getAllVariables(){
    return service.getAllVariables();
   } 
}
