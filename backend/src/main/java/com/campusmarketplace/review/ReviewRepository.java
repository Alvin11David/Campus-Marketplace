package com.campusmarketplace.review;

import com.campusmarketplace.listing.Listing;
import com.campusmarketplace.user.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r JOIN FETCH r.reviewer JOIN FETCH r.listing WHERE r.listing.id = :listingId AND r.isDeleted = false")
    Page<Review> findByListingId(@Param("listingId") Long listingId, Pageable pageable);

    @Query("SELECT r FROM Review r JOIN FETCH r.reviewer JOIN FETCH r.listing WHERE r.reviewee.id = :userId AND r.isDeleted = false")
    Page<Review> findByRevieweeId(@Param("userId") Long userId, Pageable pageable);

    Optional<Review> findByListingIdAndReviewerId(Long listingId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.listing.id = :listingId AND r.isDeleted = false")
    Double getAverageRatingForListing(@Param("listingId") Long listingId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listing.id = :listingId AND r.isDeleted = false")
    long getRatingCountForListing(@Param("listingId") Long listingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId AND r.isDeleted = false")
    Double getAverageRatingForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId AND r.isDeleted = false")
    long getRatingCountForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.isDeleted = false")
    long countActiveReviews();

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.isDeleted = false")
    double getPlatformAverageRating();
}
