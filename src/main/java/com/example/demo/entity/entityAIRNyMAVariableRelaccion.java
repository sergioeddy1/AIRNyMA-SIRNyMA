package com.example.demo.entity;



import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "vista_variablesrelaciones")
@Getter
@Setter
public class entityAIRNyMAVariableRelaccion {

    @Id
    @Column(name = "id_var")
    private String idVar;

    @Column(name = "nom_var")
    private String nomVar;

    @Column(name = "tipo_var")
    private String tipoVar;

    @Column(name = "cod_iden_var")
    private String codIdenVar;

    @Column(name = "preg_lit")
    private String pregLit;

    @Column(name = "tema")
    private String tema;

    @Column(name = "subtema")
    private String subtema;

    @Column(name = "tema2")
    private String tema2;

    @Column(name = "subtema2")
    private String subtema2;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "var_asig")
    private String varAsig;

    @Column(name = "def_var")
    private String defVar;

    @Column(name = "rel_tab")
    private String relTab;

    @Column(name = "rel_micro")
    private String relMicro;

    @Column(name = "alin_mdea")
    private String alinMdea;

    @Column(name = "alin_ods")
    private String alinOds;

    @Column(name = "coment_var")
    private String comentVar;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "microdatos", columnDefinition = "jsonb")
    private List<Map<String, Object>> microdatos;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "mdea", columnDefinition = "jsonb")
    private List<Map<String, Object>> mdea;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ods", columnDefinition = "jsonb")
    private List<Map<String, Object>> ods;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "clasificaciones", columnDefinition = "jsonb")
    private List<Map<String, Object>> clasificaciones;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "eventos", columnDefinition = "jsonb")
    private List<Map<String, Object>> eventos;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "proceso_produccion", columnDefinition = "jsonb")
    private Map<String, Object> procesoProduccion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "variables_tabulados", columnDefinition = "jsonb")
    private List<Map<String, Object>> variablesTabulados;
}