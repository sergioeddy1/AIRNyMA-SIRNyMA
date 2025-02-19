package com.example.demo.controllers;

import com.example.demo.entity.entityMicrodatos;
import com.example.demo.service.serviceMicrodatos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/microdatos")
public class MicrodatosController {
    @Autowired
    private serviceMicrodatos microdatosService;

    @GetMapping
    public List<entityMicrodatos> obtenerTodos() {
        return microdatosService.obtenerTodos();
    }
}
