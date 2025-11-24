package com.example.demo.service;

import com.example.demo.entity.entityMetaOds;
import com.example.demo.repository.repoMetaOds;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class serviceMetaOds {

    @Autowired
    private repoMetaOds repoMetaOds;

    public List<entityMetaOds> getAllMetaOds() {
        return repoMetaOds.findAll();
    }
}
