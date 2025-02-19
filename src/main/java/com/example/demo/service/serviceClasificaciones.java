package com.example.demo.service;

import com.example.demo.entity.entityClasificaciones;
import com.example.demo.repository.repoClasificaciones;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class serviceClasificaciones {
    @Autowired
    private repoClasificaciones clasificacionesRepository;

    public List<entityClasificaciones> getAllClasificaciones() {
        return clasificacionesRepository.findAll();
    }

    public Optional<entityClasificaciones> getClasificacionById(Long id) {
        return clasificacionesRepository.findById(id);
    }

    public entityClasificaciones saveClasificacion(entityClasificaciones clasificacion) {
        return clasificacionesRepository.save(clasificacion);
    }

    
}
