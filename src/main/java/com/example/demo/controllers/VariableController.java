
package com.example.demo.controllers;

import com.example.demo.entity.Variable;
import com.example.demo.service.VariableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/variables")
public class VariableController {

    @Autowired
    private VariableService variableService;

    @GetMapping
    public List<Variable> getAllVariables() {
        return variableService.getAllVariables();
    }
}
