package com.campusmarketplace.location;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/locations")
public class CampusLocationController {

    private final CampusLocationRepository campusLocationRepository;

    public CampusLocationController(CampusLocationRepository campusLocationRepository) {
        this.campusLocationRepository = campusLocationRepository;
    }

    @GetMapping
    public ResponseEntity<List<CampusLocation>> listLocations() {
        return ResponseEntity.ok(campusLocationRepository.findByIsActiveTrue());
    }
}
