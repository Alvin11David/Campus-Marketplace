package com.campusmarketplace.listing;

import com.campusmarketplace.category.Category;
import com.campusmarketplace.location.CampusLocation;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    @Query("SELECT l FROM Listing l JOIN FETCH l.owner JOIN FETCH l.category JOIN FETCH l.campusLocation WHERE l.id = :id")
    Optional<Listing> findByIdWithDetails(@Param("id") Long id);

    @Query(value = """
        SELECT l FROM Listing l JOIN FETCH l.owner JOIN FETCH l.category JOIN FETCH l.campusLocation
        WHERE l.status = 'active'
        AND (:categoryId IS NULL OR l.category.id = :categoryId)
        AND (:minPrice IS NULL OR l.price >= :minPrice)
        AND (:maxPrice IS NULL OR l.price <= :maxPrice)
        AND (:campusLocationId IS NULL OR l.campusLocation.id = :campusLocationId)
        AND (:listingType IS NULL OR l.listingType = :listingType)
        AND (:searchTerm IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
             OR LOWER(l.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        """,
        countQuery = """
        SELECT COUNT(l) FROM Listing l
        WHERE l.status = 'active'
        AND (:categoryId IS NULL OR l.category.id = :categoryId)
        AND (:minPrice IS NULL OR l.price >= :minPrice)
        AND (:maxPrice IS NULL OR l.price <= :maxPrice)
        AND (:campusLocationId IS NULL OR l.campusLocation.id = :campusLocationId)
        AND (:listingType IS NULL OR l.listingType = :listingType)
        AND (:searchTerm IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
             OR LOWER(l.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        """)
    Page<Listing> searchListings(
        @Param("searchTerm") String searchTerm,
        @Param("categoryId") Long categoryId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("campusLocationId") Long campusLocationId,
        @Param("listingType") String listingType,
        Pageable pageable);

    @Query("SELECT l FROM Listing l JOIN FETCH l.owner JOIN FETCH l.category JOIN FETCH l.campusLocation WHERE l.status = 'active' AND l.category.id = :categoryId")
    Page<Listing> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    @Query("SELECT l FROM Listing l JOIN FETCH l.owner JOIN FETCH l.category JOIN FETCH l.campusLocation WHERE l.owner.id = :ownerId ORDER BY l.createdAt DESC")
    List<Listing> findByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT l FROM Listing l JOIN FETCH l.owner JOIN FETCH l.category JOIN FETCH l.campusLocation WHERE l.status = 'active' AND l.owner.id != :userId")
    List<Listing> findActiveListingsExcluding(@Param("userId") Long userId);

    @Query("SELECT COUNT(l) FROM Listing l WHERE l.category.id = :categoryId AND l.status = 'active'")
    long countActiveByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT COUNT(l) FROM Listing l WHERE l.status = 'active'")
    long countActive();

    @Query("SELECT l.category.id AS categoryId, l.category.name AS categoryName, COUNT(l) AS listingCount FROM Listing l WHERE l.status = 'active' GROUP BY l.category.id, l.category.name ORDER BY l.category.name")
    List<CategoryListingCount> countActiveListingsByCategory();

    @jakarta.transaction.Transactional
    @Modifying
    @Query("UPDATE Listing l SET l.viewCount = l.viewCount + 1 WHERE l.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
