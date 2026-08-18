package com.campusmarketplace.listing;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListingImageRepository extends JpaRepository<ListingImage, Long> {
    List<ListingImage> findByListingIdOrderBySortOrderAsc(Long listingId);
    int countByListingId(Long listingId);
    void deleteByListingId(Long listingId);

    @Query("SELECT li FROM ListingImage li WHERE li.listing.id IN :listingIds ORDER BY li.sortOrder")
    List<ListingImage> findByListingIdIn(@Param("listingIds") List<Long> listingIds);
}
