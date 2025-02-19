package com.example.demo.service;

import com.example.demo.entity.entityProcesoProduccion;
import com.example.demo.repository.repoProcesoProduccion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceProcesoProduccion {

    @Autowired
    private repoProcesoProduccion procProdRepository;

    public List<entityProcesoProduccion> getAllProcProd() {
        return procProdRepository.findAll();
    }
    
}
