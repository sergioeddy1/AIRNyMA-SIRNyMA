package com.example.demo.service;

import com.example.demo.entity.entityOds;
import com.example.demo.repository.repoOds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceOds {
    @Autowired
    private repoOds odsRepository;

    public List<entityOds> obtenerTodos() {
        return odsRepository.findAll();
    }
}
