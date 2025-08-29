
package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "indicadores_ambientales")
public class EntityIndicadores {
    @Id
    private Long id;
    private String nombreIndicador;
    private String tipoIndicador;
    private String descripcionCorta;
    private String descripcionValor;
    private String definicionVariables;
    private String unidadMedida;
    private String formulaCalculo;
    private String alcance;
    private String limitaciones;
    private String relevancia;
    private String fraseTendencia;
    private String notasSerie;
    private String cobertura;
    private String desagregacion;
    private String metodoCaptura;
    private String disponibilidadDatos;
    private String periodicidadDatos;
    private String periodoDisponible;
    private String periodicidadActualizacion;
    private String relacionPoliticasAmbientales;
    private String TablaGraficos;
    private String tablaDatos; // Puedes mapear JSONB como String o usar una clase específica si lo deseas
    private String fuenteDatos;
    private String requisitosCoordinacion;

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombreIndicador() { return nombreIndicador; }
    public void setNombreIndicador(String nombreIndicador) { this.nombreIndicador = nombreIndicador; }

    public String getTipoIndicador() { return tipoIndicador; }
    public void setTipoIndicador(String tipoIndicador) { this.tipoIndicador = tipoIndicador; }

    public String getDescripcionCorta() { return descripcionCorta; }
    public void setDescripcionCorta(String descripcionCorta) { this.descripcionCorta = descripcionCorta; }

    public String getDescripcionValor() { return descripcionValor; }
    public void setDescripcionValor(String descripcionValor) { this.descripcionValor = descripcionValor; }

    public String getDefinicionVariables() { return definicionVariables; }
    public void setDefinicionVariables(String definicionVariables) { this.definicionVariables = definicionVariables; }

    public String getUnidadMedida() { return unidadMedida; }
    public void setUnidadMedida(String unidadMedida) { this.unidadMedida = unidadMedida; }

    public String getFormulaCalculo() { return formulaCalculo; }
    public void setFormulaCalculo(String formulaCalculo) { this.formulaCalculo = formulaCalculo; }

    public String getAlcance() { return alcance; }
    public void setAlcance(String alcance) { this.alcance = alcance; }

    public String getLimitaciones() { return limitaciones; }
    public void setLimitaciones(String limitaciones) { this.limitaciones = limitaciones; }

    public String getRelevancia() { return relevancia; }
    public void setRelevancia(String relevancia) { this.relevancia = relevancia; }

    public String getFraseTendencia() { return fraseTendencia; }
    public void setFraseTendencia(String fraseTendencia) { this.fraseTendencia = fraseTendencia; }

    public String getNotasSerie() { return notasSerie; }
    public void setNotasSerie(String notasSerie) { this.notasSerie = notasSerie; }

    public String getCobertura() { return cobertura; }
    public void setCobertura(String cobertura) { this.cobertura = cobertura; }

    public String getDesagregacion() { return desagregacion; }
    public void setDesagregacion(String desagregacion) { this.desagregacion = desagregacion; }

    public String getMetodoCaptura() { return metodoCaptura; }
    public void setMetodoCaptura(String metodoCaptura) { this.metodoCaptura = metodoCaptura; }

    public String getDisponibilidadDatos() { return disponibilidadDatos; }
    public void setDisponibilidadDatos(String disponibilidadDatos) { this.disponibilidadDatos = disponibilidadDatos; }

    public String getPeriodicidadDatos() { return periodicidadDatos; }
    public void setPeriodicidadDatos(String periodicidadDatos) { this.periodicidadDatos = periodicidadDatos; }

    public String getPeriodoDisponible() { return periodoDisponible; }
    public void setPeriodoDisponible(String periodoDisponible) { this.periodoDisponible = periodoDisponible; }

    public String getPeriodicidadActualizacion() { return periodicidadActualizacion; }
    public void setPeriodicidadActualizacion(String periodicidadActualizacion) { this.periodicidadActualizacion = periodicidadActualizacion; }

    public String getRelacionPoliticasAmbientales() { return relacionPoliticasAmbientales; }
    public void setRelacionPoliticasAmbientales(String relacionPoliticasAmbientales) { this.relacionPoliticasAmbientales = relacionPoliticasAmbientales; }

    public String getTablaGraficos() { return TablaGraficos; }
    public void setTablaGraficos(String TablaGraficos) { this.TablaGraficos = TablaGraficos; }

    public String getTablaDatos() { return tablaDatos; }
    public void setTablaDatos(String tablaDatos) { this.tablaDatos = tablaDatos; }

    public String getFuenteDatos() { return fuenteDatos; }
    public void setFuenteDatos(String fuenteDatos) { this.fuenteDatos = fuenteDatos; }

    public String getRequisitosCoordinacion() { return requisitosCoordinacion; }
    public void setRequisitosCoordinacion(String requisitosCoordinacion) { this.requisitosCoordinacion = requisitosCoordinacion; }
}
