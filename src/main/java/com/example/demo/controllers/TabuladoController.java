package com.example.demo.controllers;

import com.example.demo.entity.entityTabulado;
import com.example.demo.service.serviceTabulado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tabulado")
public class TabuladoController {
    @Autowired
    private serviceTabulado tabuladoService;

    // Obtener todos los tabulados
    @GetMapping
    public List<entityTabulado> obtenerTodosLosTabulados() {
        return tabuladoService.obtenerTodosLosTabulados();
    }

    // Obtener un tabulado por ID
    @GetMapping("/{id}")
    public entityTabulado obtenerTabuladoPorId(@PathVariable String id) {
        return tabuladoService.obtenerTabuladoPorId(id);
    }
}
