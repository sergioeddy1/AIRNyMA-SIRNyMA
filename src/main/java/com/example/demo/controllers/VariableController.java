
package com.example.demo.controllers;

import com.example.demo.entity.Variable;
import com.example.demo.service.VariableService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/variables")
public class VariableController {

    private final VariableService variableService;

    public VariableController(VariableService variableService) {
        this.variableService = variableService;
    }

    @GetMapping
    public List<Variable> getAllVariables() {
        return variableService.getAllVariables();
    }

    @GetMapping("/extendidas")
    public List<Variable> getAllVariablesExtendidas() {
        return variableService.getAllVariablesWithIndicadores();
    }
}
