package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.VarTabId;
import com.example.demo.entity.entityVar_Tab;

public interface repoVar_Tab extends JpaRepository<entityVar_Tab, VarTabId>{
    
}
