package com.example.demo.controllers;

import com.example.demo.entity.EntityIndicadores;
import com.example.demo.service.serviceIndicadores;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/indicadores_ambientales")
public class IndicadoresController {

    @Autowired
    private serviceIndicadores indicadoresService;

    @GetMapping
    public List<EntityIndicadores> getAllIndicadores() {
        return indicadoresService.getAllIndicadores();
    }
}
