package com.example.demo.config; // <-- usa tu propio paquete aquí

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // aplica a todas las rutas bajo /api/
                .allowedOrigins("https://sergioeddy1.github.io/") // tu sitio en GitHub Pages
                .allowedMethods("GET", "POST", "PUT", "DELETE") // métodos permitidos
                .allowedHeaders("*"); // permite todos los headers
    }
}