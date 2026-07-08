package com.campusmarketplace.review.dto;

import com.campusmarketplace.review.Review;
import java.time.Instant;

public record ReviewResponse(
    Long id,
    Long listingId,
    ReviewerInfo reviewer,
    int rating,
    String comment,
    Instant createdAt
) {
    public static ReviewResponse from(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getListing().getId(),
            new ReviewerInfo(review.getReviewer().getId(), review.getReviewer().getFullName(),
                review.getReviewer().getProfilePhotoUrl()),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }

    public record ReviewerInfo(Long id, String fullName, String profilePhotoUrl) {}
}
