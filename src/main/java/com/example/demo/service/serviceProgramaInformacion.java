package com.example.demo.service;

import com.example.demo.entity.entityProgramaInformacion;
import com.example.demo.repository.repoProgramasInformacion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceProgramaInformacion {
    @Autowired
    private repoProgramasInformacion progInforRepository;

    public List<entityProgramaInformacion> getAllProgInfor() {
        return progInforRepository.findAll();
    }
}
