package com.example.demo.service;

import com.example.demo.entity.entityFuenteIdentificacion;
import com.example.demo.repository.repoFuenteIdentificacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class serviceFuenteIdentificacion {
    @Autowired
    private repoFuenteIdentificacion fuenteIdenRepository;

    public List<entityFuenteIdentificacion> getAllFuentesIden() {
        return fuenteIdenRepository.findAll();
    }
}
