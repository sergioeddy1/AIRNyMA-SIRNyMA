package com.example.demo.controllers;

import com.example.demo.entity.entityUsuarios;
import com.example.demo.service.serviceUsuarios;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuariosController {
    @Autowired
    private serviceUsuarios usuariosService;

    @GetMapping
    public List<entityUsuarios> getAllUsuarios() {
        return usuariosService.getAllUsuarios();
    }
}
