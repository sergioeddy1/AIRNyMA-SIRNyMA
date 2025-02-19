package com.example.demo.service;

import com.example.demo.entity.entityVar_Tab;
import com.example.demo.repository.repoVar_Tab;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceVar_Tab {
    @Autowired
    private repoVar_Tab varTabRepository;

    public List<entityVar_Tab> obtenerTodos() {
        return varTabRepository.findAll();
    }
}
