package com.example.demo.service;

import com.example.demo.entity.entityTabulado;
import com.example.demo.repository.repoTabulados;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceTabulado {
    @Autowired
    private repoTabulados tabuladoRepository;

    public List<entityTabulado> obtenerTodosLosTabulados() {
        return tabuladoRepository.findAll();
    }

    public entityTabulado obtenerTabuladoPorId(String id) {
        return tabuladoRepository.findById(id).orElse(null);
    }
}
