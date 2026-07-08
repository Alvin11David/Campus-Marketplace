package com.campusmarketplace.listing;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    List<ListingImage> findByListingIdOrderBySortOrderAsc(Long listingId);
    int countByListingId(Long listingId);
    void deleteByListingId(Long listingId);
}
