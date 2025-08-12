package com.example.demo.service;

import com.example.demo.entity.EntityIndicadores;
import com.example.demo.repository.repoIndicadores;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceIndicadores {

    @Autowired
    private repoIndicadores repoIndicadores;

    public List<EntityIndicadores> getAllIndicadores() {
        return repoIndicadores.findAll();
    }
}
