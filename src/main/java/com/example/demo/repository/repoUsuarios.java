package com.example.demo.repository;

import com.example.demo.entity.entityUsuarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface repoUsuarios extends JpaRepository<entityUsuarios, String>{
	
}
