package com.example.demo.service;

import com.example.demo.entity.Variable;
import com.example.demo.repository.VariableRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VariableService {

    @Autowired
    private VariableRepository variableRepository;

    public List<Variable> getAllVariables() {
        return variableRepository.findAll();
    }
}
