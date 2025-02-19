package com.example.demo.entity;

import lombok.EqualsAndHashCode;
import java.io.Serializable;

@EqualsAndHashCode
public class OdsId implements Serializable{
    private Long idOds;
    private String idVar;

    public OdsId() {
    }

    public OdsId(Long idOds, String idVar) {
        this.idOds = idOds;
        this.idVar = idVar;
    }
}
