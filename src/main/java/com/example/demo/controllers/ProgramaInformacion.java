package com.example.demo.controllers;

import com.example.demo.entity.entityProgramaInformacion;
import com.example.demo.service.serviceProgramaInformacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programa")
public class ProgramaInformacion {
    @Autowired
    private serviceProgramaInformacion progInforService;

    @GetMapping
    public List<entityProgramaInformacion> getAllProgInfor() {
        return progInforService.getAllProgInfor();
    }
}
