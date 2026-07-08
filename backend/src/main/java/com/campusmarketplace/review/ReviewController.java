package com.campusmarketplace.review;

import com.campusmarketplace.review.dto.CreateReviewRequest;
import com.campusmarketplace.review.dto.ReviewResponse;
import com.campusmarketplace.review.dto.UpdateReviewRequest;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.User;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponse> submitReview(@CurrentUser User user,
                                                       @Valid @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reviewService.submitReview(user, request));
    }

    @PatchMapping("/reviews/{id}")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable Long id,
                                                       @CurrentUser User user,
                                                       @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseEntity.ok(reviewService.updateReview(id, user, request));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, @CurrentUser User user) {
        reviewService.deleteReview(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/listings/{listingId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getListingReviews(@PathVariable Long listingId,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(reviewService.getListingReviews(listingId, page, pageSize));
    }

    @GetMapping("/users/{userId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getUserReviews(@PathVariable Long userId,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId, page, pageSize));
    }
}
