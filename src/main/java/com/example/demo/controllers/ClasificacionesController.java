package com.example.demo.controllers;

import com.example.demo.entity.entityClasificaciones;
import com.example.demo.service.serviceClasificaciones;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clasificaciones")
public class ClasificacionesController {
    @Autowired
    private serviceClasificaciones clasificacionesService;

    @GetMapping
    public List<entityClasificaciones> getAllClasificaciones() {
        return clasificacionesService.getAllClasificaciones();
    }

    @GetMapping("/{id}")
    public Optional<entityClasificaciones> getClasificacionById(@PathVariable Long id) {
        return clasificacionesService.getClasificacionById(id);
    }

    @PostMapping
    public entityClasificaciones createClasificacion(@RequestBody entityClasificaciones clasificacion) {
        return clasificacionesService.saveClasificacion(clasificacion);
    }

    
}
