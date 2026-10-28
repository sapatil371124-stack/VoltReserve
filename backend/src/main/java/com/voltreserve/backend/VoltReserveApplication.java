package com.voltreserve.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class VoltReserveApplication {
    public static void main(String[] args) {
        SpringApplication.run(VoltReserveApplication.class, args);
    }
}
