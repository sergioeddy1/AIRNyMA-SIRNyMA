package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "variable")
public class Variable {

    @Id
    @Column(name = "id_var", nullable = false)
    private String idVar;

    @Column(name = "id_pp")
    private String idPp;

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

    // Getters y Setters
    public String getIdVar() { return idVar; }
    public void setIdVar(String idVar) { this.idVar = idVar; }

    public String getIdPp() { return idPp; }
    public void setIdPp(String idPp) { this.idPp = idPp; }

    public String getNomVar() { return nomVar; }
    public void setNomVar(String nomVar) { this.nomVar = nomVar; }

    public String getTipoVar() { return tipoVar; }
    public void setTipoVar(String tipoVar) { this.tipoVar = tipoVar; }

    public String getCodIdenVar() { return codIdenVar; }
    public void setCodIdenVar(String codIdenVar) { this.codIdenVar = codIdenVar; }

    public String getPregLit() { return pregLit; }
    public void setPregLit(String pregLit) { this.pregLit = pregLit; }

    public String getTema() { return tema; }
    public void setTema(String tema) { this.tema = tema; }

    public String getSubtema() { return subtema; }
    public void setSubtema(String subtema) { this.subtema = subtema; }

    public String getTema2() { return tema2; }
    public void setTema2(String tema2) { this.tema2 = tema2; }

    public String getSubtema2() { return subtema2; }
    public void setSubtema2(String subtema2) { this.subtema2 = subtema2; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getVarAsig() { return varAsig; }
    public void setVarAsig(String varAsig) { this.varAsig = varAsig; }

    public String getDefVar() { return defVar; }
    public void setDefVar(String defVar) { this.defVar = defVar; }

    public String getRelTab() { return relTab; }
    public void setRelTab(String relTab) { this.relTab = relTab; }

    public String getRelMicro() { return relMicro; }
    public void setRelMicro(String relMicro) { this.relMicro = relMicro; }

    public String getAlinMdea() { return alinMdea; }
    public void setAlinMdea(String alinMdea) { this.alinMdea = alinMdea; }

    public String getAlinOds() { return alinOds; }
    public void setAlinOds(String alinOds) { this.alinOds = alinOds; }

    public String getComentVar() { return comentVar; }
    public void setComentVar(String comentVar) { this.comentVar = comentVar; }
}
