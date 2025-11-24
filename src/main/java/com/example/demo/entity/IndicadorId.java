package com.example.demo.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * Clave compuesta para pull_ods_indicador:
 * id_objetivo (int), id_meta (text), id_indicador (int)
 */
public class IndicadorId implements Serializable {
    private Integer id_objetivo;
    private String id_meta;
    private Integer id_indicador;

    public IndicadorId() {}

    public IndicadorId(Integer id_objetivo, String id_meta, Integer id_indicador) {
        this.id_objetivo = id_objetivo;
        this.id_meta = id_meta;
        this.id_indicador = id_indicador;
    }

    public Integer getId_objetivo() { return id_objetivo; }
    public void setId_objetivo(Integer id_objetivo) { this.id_objetivo = id_objetivo; }

    public String getId_meta() { return id_meta; }
    public void setId_meta(String id_meta) { this.id_meta = id_meta; }

    public Integer getId_indicador() { return id_indicador; }
    public void setId_indicador(Integer id_indicador) { this.id_indicador = id_indicador; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof IndicadorId)) return false;
        IndicadorId that = (IndicadorId) o;
        return Objects.equals(id_objetivo, that.id_objetivo) &&
               Objects.equals(id_meta, that.id_meta) &&
               Objects.equals(id_indicador, that.id_indicador);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_objetivo, id_meta, id_indicador);
    }
}