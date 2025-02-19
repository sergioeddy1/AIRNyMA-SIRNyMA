package com.example.demo.controllers;

import com.example.demo.entity.entityFuenteIdentificacion;
import com.example.demo.service.serviceFuenteIdentificacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuente")
public class FuenteIdentificacionController {
    @Autowired
    private serviceFuenteIdentificacion fuenteIdenService;

    @GetMapping
    public List<entityFuenteIdentificacion> getAllFuentesIden() {
        return fuenteIdenService.getAllFuentesIden();
    }
}
