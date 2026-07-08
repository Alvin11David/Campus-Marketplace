package com.campusmarketplace.config;

import com.campusmarketplace.category.Category;
import com.campusmarketplace.category.CategoryRepository;
import com.campusmarketplace.location.CampusLocation;
import com.campusmarketplace.location.CampusLocationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CampusLocationRepository campusLocationRepository;
    private final CategoryRepository categoryRepository;

    public DataSeeder(CampusLocationRepository campusLocationRepository, CategoryRepository categoryRepository) {
        this.campusLocationRepository = campusLocationRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (campusLocationRepository.count() == 0) {
            campusLocationRepository.save(new CampusLocation("Main Campus", "central"));
            campusLocationRepository.save(new CampusLocation("Annex", "north"));
            campusLocationRepository.save(new CampusLocation("Hostel Area A", "south"));
            campusLocationRepository.save(new CampusLocation("Hostel Area B", "south"));
        }

        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category("Printing & Photocopying", "printing-photocopying", "service", "printer"));
            categoryRepository.save(new Category("Device Repair", "device-repair", "service", "wrench"));
            categoryRepository.save(new Category("Tutoring", "tutoring", "service", "book-open"));
            categoryRepository.save(new Category("Hair & Beauty", "hair-beauty", "both", "scissors"));
            categoryRepository.save(new Category("Laundry & Event Planning", "laundry-event-planning", "service", "sparkles"));
            categoryRepository.save(new Category("Campus Products", "campus-products", "product", "package"));
        }
    }
}
