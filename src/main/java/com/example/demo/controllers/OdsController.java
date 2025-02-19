package com.example.demo.controllers;

import com.example.demo.entity.entityOds;
import com.example.demo.service.serviceOds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ods")
public class OdsController {
    @Autowired
    private serviceOds odsService;

    @GetMapping
    public List<entityOds> obtenerTodos() {
        return odsService.obtenerTodos();
    }
}
