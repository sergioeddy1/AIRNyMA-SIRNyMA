package com.example.demo.service;

import com.example.demo.entity.entityIndicadoresOds;
import com.example.demo.repository.repoIndicadoresOds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceIndicadoresOds {

    @Autowired
    private repoIndicadoresOds repoIndicadoresOds;

    public List<entityIndicadoresOds> getAllIndicadoresOds() {
        return repoIndicadoresOds.findAll();
    }
}
