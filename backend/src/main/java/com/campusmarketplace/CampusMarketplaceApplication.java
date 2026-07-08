package com.campusmarketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CampusMarketplaceApplication {
    public static void main(String[] args) {
        SpringApplication.run(CampusMarketplaceApplication.class, args);
    }
}
