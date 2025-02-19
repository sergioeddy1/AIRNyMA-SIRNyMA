package com.example.demo.controllers;

import com.example.demo.entity.entityProcesoProduccion;
import com.example.demo.service.serviceProcesoProduccion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proceso")
public class ProcesoProduccionController {
    @Autowired
    private serviceProcesoProduccion procProdService;

    @GetMapping
    public List<entityProcesoProduccion> getAllProcProd() {
        return procProdService.getAllProcProd();
    }
}
