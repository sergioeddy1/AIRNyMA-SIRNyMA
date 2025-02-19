package com.example.demo.controllers;

import com.example.demo.entity.entityMdea;
import com.example.demo.service.serviceMdea;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mdea")
public class MdeaController {
    @Autowired
    private serviceMdea mdeaService;

    @GetMapping
    public List<entityMdea> obtenerTodos() {
        return mdeaService.obtenerTodos();
    }
}
