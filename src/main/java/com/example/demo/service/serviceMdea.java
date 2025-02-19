package com.example.demo.service;

import com.example.demo.entity.entityMdea;
import com.example.demo.repository.repoMdea;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceMdea {
    @Autowired
    private repoMdea mdeaRepository;

    public List<entityMdea> obtenerTodos() {
        return mdeaRepository.findAll();
    }
}
