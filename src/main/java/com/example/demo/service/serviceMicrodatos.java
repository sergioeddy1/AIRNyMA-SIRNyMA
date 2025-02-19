package com.example.demo.service;

import com.example.demo.entity.entityMicrodatos;
import com.example.demo.repository.repoMicrodatos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceMicrodatos {
    @Autowired
    private repoMicrodatos microdatosRepository;

    public List<entityMicrodatos> obtenerTodos() {
        return microdatosRepository.findAll();
    }
}
