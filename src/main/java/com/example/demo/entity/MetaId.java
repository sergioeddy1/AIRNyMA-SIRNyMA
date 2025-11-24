package com.example.demo.entity;

import java.io.Serializable;
import java.util.Objects;

/**
 * Id compuesto para entityMetaOds (id_objetivo, id_meta)
 */
public class MetaId implements Serializable {
    private Integer id_objetivo;
    private String id_meta;

    public MetaId() {}

    public MetaId(Integer id_objetivo, String id_meta) {
        this.id_objetivo = id_objetivo;
        this.id_meta = id_meta;
    }

    public Integer getId_objetivo() { return id_objetivo; }
    public void setId_objetivo(Integer id_objetivo) { this.id_objetivo = id_objetivo; }

    public String getId_meta() { return id_meta; }
    public void setId_meta(String id_meta) { this.id_meta = id_meta; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MetaId)) return false;
        MetaId metaId = (MetaId) o;
        return Objects.equals(id_objetivo, metaId.id_objetivo) &&
               Objects.equals(id_meta, metaId.id_meta);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_objetivo, id_meta);
    }
}