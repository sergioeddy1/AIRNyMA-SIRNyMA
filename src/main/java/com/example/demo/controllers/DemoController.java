package com.example.demo.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
public class DemoController {
    
   @GetMapping("/api/demo")
   public String demoMessage() {
    
       return "Hola mundo";
   }
    
   
}
