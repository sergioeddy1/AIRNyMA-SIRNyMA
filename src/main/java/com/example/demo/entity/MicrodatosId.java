package com.example.demo.entity;

import java.io.Serializable;

import lombok.EqualsAndHashCode;

@EqualsAndHashCode
public class MicrodatosId implements Serializable{
     private Long idMd;
    private String idVar;

    public MicrodatosId() {}

    public MicrodatosId(Long idMd, String idVar) {
        this.idMd = idMd;
        this.idVar = idVar;
    }
}
