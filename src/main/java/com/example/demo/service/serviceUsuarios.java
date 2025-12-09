package com.example.demo.service;

import com.example.demo.entity.entityUsuarios;
import com.example.demo.repository.repoUsuarios;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceUsuarios {
    @Autowired
    private repoUsuarios usuariosRepository;

    public List<entityUsuarios> getAllUsuarios() {
        return usuariosRepository.findAll();
    }
}
