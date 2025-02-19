package com.example.demo.controllers;

import com.example.demo.entity.entityEventos;
import com.example.demo.service.serviceEventos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
public class EventosController {
    @Autowired
    private serviceEventos eventosService;

    // Obtener todos los eventos
    @GetMapping
    public List<entityEventos> obtenerTodosLosEventos() {
        return eventosService.obtenerTodosLosEventos();
    }

    // Obtener un evento por ID
    @GetMapping("/{id}")
    public entityEventos obtenerEventoPorId(@PathVariable Long id) {
        return eventosService.obtenerEventoPorId(id);
    }
}
