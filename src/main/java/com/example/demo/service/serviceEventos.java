package com.example.demo.service;


import com.example.demo.entity.entityEventos;

import com.example.demo.repository.repoEventos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceEventos {
    @Autowired
    private repoEventos eventosRepository;

    public List<entityEventos> obtenerTodosLosEventos() {
        return eventosRepository.findAll();
    }

    public entityEventos obtenerEventoPorId(Long id) {
        return eventosRepository.findById(id).orElse(null);
    }
}
