package com.campusmarketplace.location;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusLocationRepository extends JpaRepository<CampusLocation, Long> {
    List<CampusLocation> findByIsActiveTrue();
}
