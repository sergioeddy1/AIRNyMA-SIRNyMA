package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "variables_tabulados")
@IdClass(VarTabId.class)
public class entityVar_Tab {

    @Id
    @Column(name = "id_var")
    private String idVar;

    @Id
    @Column(name = "id_tab")
    private String idTab;

    @Column(name = "var_asig")
    private String varAsig;

    @Column(name = "coment_vartab")
    private String comentVarTab;
}