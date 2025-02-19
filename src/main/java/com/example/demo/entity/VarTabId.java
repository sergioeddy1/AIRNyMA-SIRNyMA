package com.example.demo.entity;

import lombok.EqualsAndHashCode;
import java.io.Serializable;

@EqualsAndHashCode
public class VarTabId implements Serializable{
    private String idVar;
    private String idTab;

    // Constructor vacío necesario para JPA
    public VarTabId() {
    }

    public VarTabId(String idVar, String idTab) {
        this.idVar = idVar;
        this.idTab = idTab;
    }
}
