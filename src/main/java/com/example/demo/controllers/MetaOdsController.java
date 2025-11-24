package com.example.demo.controllers;

import com.example.demo.entity.entityMetaOds;
import com.example.demo.service.serviceMetaOds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meta_ods")
public class MetaOdsController {
    @Autowired
    private serviceMetaOds MetaOdsService;

    @GetMapping
    public List<entityMetaOds> getAllMetasOds() {
        return MetaOdsService.getAllMetaOds();
    }
    
}
