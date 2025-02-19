package com.example.demo.controllers;

import com.example.demo.entity.entityVar_Tab;
import com.example.demo.service.serviceVar_Tab;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/var-tab")
public class Var_TabController {
    @Autowired
    private serviceVar_Tab varTabService;

    @GetMapping
    public List<entityVar_Tab> obtenerTodos() {
        return varTabService.obtenerTodos();
    }
}
