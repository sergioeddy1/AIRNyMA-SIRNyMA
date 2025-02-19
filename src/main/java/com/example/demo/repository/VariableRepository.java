package com.example.demo.repository;

import com.example.demo.entity.Variable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariableRepository extends JpaRepository<Variable, String> {
    // Aquí puedes agregar consultas personalizadas si las necesitas más adelante
}
