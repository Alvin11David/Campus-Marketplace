package com.campusmarketplace.review;

import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.messaging.ConversationRepository;
import com.campusmarketplace.notification.NotificationService;
import com.campusmarketplace.review.dto.CreateReviewRequest;
import com.campusmarketplace.review.dto.ReviewResponse;
import com.campusmarketplace.review.dto.UpdateReviewRequest;
import com.campusmarketplace.user.User;
import com.campusmarketplace.user.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository, ListingRepository listingRepository,
                         UserRepository userRepository, ConversationRepository conversationRepository,
                         NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReviewResponse submitReview(User reviewer, CreateReviewRequest request) {
        var listing = listingRepository.findByIdWithDetails(request.listingId())
            .orElseThrow(() -> ApiException.notFound("Listing not found"));

        if (listing.getOwner().getId().equals(reviewer.getId())) {
            throw ApiException.badRequest("You cannot review your own listing");
        }

        boolean hasConversation = conversationRepository.findExisting(
            request.listingId(), reviewer.getId(), listing.getOwner().getId()).isPresent();
        if (!hasConversation) {
            log.warn("Review blocked: no conversation found for listing={} reviewer={} owner={}",
                request.listingId(), reviewer.getId(), listing.getOwner().getId());
            throw ApiException.forbidden("You need to have messaged this provider before leaving a review");
        }

        if (reviewRepository.findByListingIdAndReviewerId(request.listingId(), reviewer.getId()).isPresent()) {
            var existing = reviewRepository.findByListingIdAndReviewerId(request.listingId(), reviewer.getId()).get();
            throw ApiException.conflict("You have already reviewed this listing");
        }

        var review = new Review();
        review.setListing(listing);
        review.setReviewer(reviewer);
        review.setReviewee(listing.getOwner());
        review.setRating(request.rating());
        review.setComment(request.comment());
        review = reviewRepository.save(review);

        recalculateRatings(listing);

        notificationService.notify(listing.getOwner(), "new_review",
            "New " + request.rating() + "-star review from " + reviewer.getFullName(),
            request.comment(), "listing", listing.getId());

        return ReviewResponse.from(review);
    }

    @Transactional
    public ReviewResponse updateReview(Long reviewId, User reviewer, UpdateReviewRequest request) {
        var review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> ApiException.notFound("Review not found"));

        if (!review.getReviewer().getId().equals(reviewer.getId())) {
            throw ApiException.forbidden("You can only edit your own review");
        }

        if (request.rating() != null) review.setRating(request.rating());
        if (request.comment() != null) review.setComment(request.comment());
        review = reviewRepository.save(review);

        recalculateRatings(review.getListing());
        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteReview(Long reviewId, User currentUser) {
        var review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> ApiException.notFound("Review not found"));

        if (!review.getReviewer().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw ApiException.forbidden("You do not have permission to delete this review");
        }

        review.setDeleted(true);
        reviewRepository.save(review);
        recalculateRatings(review.getListing());
    }

    public Page<ReviewResponse> getListingReviews(Long listingId, int page, int pageSize) {
        return reviewRepository.findByListingId(listingId, PageRequest.of(page, pageSize))
            .map(ReviewResponse::from);
    }

    public Page<ReviewResponse> getUserReviews(Long userId, int page, int pageSize) {
        return reviewRepository.findByRevieweeId(userId, PageRequest.of(page, pageSize))
            .map(ReviewResponse::from);
    }

    @Transactional
    public void recalculateRatings(com.campusmarketplace.listing.Listing listing) {
        Double listingAvg = reviewRepository.getAverageRatingForListing(listing.getId());
        long listingCount = reviewRepository.getRatingCountForListing(listing.getId());

        listing.setAvgRating(listingAvg != null
            ? BigDecimal.valueOf(listingAvg).setScale(1, RoundingMode.HALF_UP) : null);
        listing.setRatingCount((int) listingCount);
        listingRepository.save(listing);

        Double userAvg = reviewRepository.getAverageRatingForUser(listing.getOwner().getId());
        long userCount = reviewRepository.getRatingCountForUser(listing.getOwner().getId());

        var owner = listing.getOwner();
        owner.setAvgRating(userAvg != null
            ? BigDecimal.valueOf(userAvg).setScale(1, RoundingMode.HALF_UP) : null);
        owner.setRatingCount((int) userCount);
        userRepository.save(owner);
    }
}
