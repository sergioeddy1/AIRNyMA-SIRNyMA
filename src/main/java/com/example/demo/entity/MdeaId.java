package com.example.demo.entity;

import lombok.EqualsAndHashCode;
import java.io.Serializable;

@EqualsAndHashCode
public class MdeaId implements Serializable{
    private Long idMdea;
    private String idVar;

    public MdeaId() {
    }

    public MdeaId(Long idMdea, String idVar) {
        this.idMdea = idMdea;
        this.idVar = idVar;
    }
}
