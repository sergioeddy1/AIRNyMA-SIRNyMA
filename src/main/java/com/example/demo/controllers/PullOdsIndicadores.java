package com.example.demo.controllers;

import com.example.demo.entity.entityIndicadoresOds;
import com.example.demo.service.serviceIndicadoresOds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ods_indicadores")
public class PullOdsIndicadores {
    @Autowired
    private serviceIndicadoresOds IndicadoresOdsService;

    @GetMapping
    public List<entityIndicadoresOds> getAllIndicadoresOds() {
        return IndicadoresOdsService.getAllIndicadoresOds();
    }
    
}
