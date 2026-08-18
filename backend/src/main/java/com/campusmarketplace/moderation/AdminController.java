package com.campusmarketplace.moderation;

import com.campusmarketplace.category.CategoryRepository;
import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.listing.SearchLogRepository;
import com.campusmarketplace.listing.dto.ListingResponse;
import com.campusmarketplace.messaging.MessageRepository;
import com.campusmarketplace.notification.NotificationRepository;
import com.campusmarketplace.review.ReviewRepository;
import com.campusmarketplace.user.UserRepository;
import com.campusmarketplace.user.dto.PublicProfileResponse;
import com.campusmarketplace.user.dto.UserProfileResponse;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.User;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ModerationService moderationService;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;
    private final ReportRepository reportRepository;
    private final AdminActionLogRepository adminActionLogRepository;
    private final NotificationRepository notificationRepository;
    private final com.campusmarketplace.listing.ListingImageRepository listingImageRepository;
    private final MessageRepository messageRepository;
    private final CategoryRepository categoryRepository;
    private final SearchLogRepository searchLogRepository;

    public AdminController(ModerationService moderationService, UserRepository userRepository,
                           ListingRepository listingRepository, ReviewRepository reviewRepository,
                           ReportRepository reportRepository, AdminActionLogRepository adminActionLogRepository,
                           NotificationRepository notificationRepository,
                           com.campusmarketplace.listing.ListingImageRepository listingImageRepository,
                           MessageRepository messageRepository, CategoryRepository categoryRepository,
                           SearchLogRepository searchLogRepository) {
        this.moderationService = moderationService;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.reviewRepository = reviewRepository;
        this.reportRepository = reportRepository;
        this.adminActionLogRepository = adminActionLogRepository;
        this.notificationRepository = notificationRepository;
        this.listingImageRepository = listingImageRepository;
        this.messageRepository = messageRepository;
        this.categoryRepository = categoryRepository;
        this.searchLogRepository = searchLogRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<Page<PublicProfileResponse>> listUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int pageSize) {
        var userPage = userRepository.findAll(PageRequest.of(page, pageSize));
        return ResponseEntity.ok(userPage.map(PublicProfileResponse::from));
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<Map<String, String>> suspendUser(@PathVariable Long id, @CurrentUser User admin,
                                                            @RequestBody Map<String, String> body) {
        moderationService.suspendUser(id, admin, body.getOrDefault("reason", "No reason provided"));
        return ResponseEntity.ok(Map.of("detail", "User suspended"));
    }

    @PostMapping("/users/{id}/reactivate")
    public ResponseEntity<Map<String, String>> reactivateUser(@PathVariable Long id, @CurrentUser User admin) {
        moderationService.reactivateUser(id, admin);
        return ResponseEntity.ok(Map.of("detail", "User reactivated"));
    }

    @PostMapping("/users/{id}/verify")
    public ResponseEntity<Map<String, String>> verifyUser(@PathVariable Long id, @CurrentUser User admin) {
        var user = userRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("detail", "User verified"));
    }

    @PostMapping("/listings/{id}/status")
    public ResponseEntity<Map<String, String>> deactivateListing(@PathVariable Long id, @CurrentUser User admin,
                                                                   @RequestBody Map<String, String> body) {
        moderationService.deactivateListing(id, admin, body.getOrDefault("reason", "No reason provided"));
        return ResponseEntity.ok(Map.of("detail", "Listing deactivated"));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id, @CurrentUser User admin,
                                              @RequestBody Map<String, String> body) {
        moderationService.deleteReview(id, admin, body.getOrDefault("reason", "No reason provided"));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports")
    public ResponseEntity<Page<Report>> listReports(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String targetType,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(reportRepository.findByFilters(status, targetType, PageRequest.of(page, pageSize)));
    }

    @PostMapping("/reports/{id}/resolve")
    public ResponseEntity<Map<String, String>> resolveReport(@PathVariable Long id, @CurrentUser User admin,
                                                              @RequestBody Map<String, Object> body) {
        String resolution = (String) body.getOrDefault("resolution", "dismissed");
        String notes = (String) body.getOrDefault("resolution_notes", "");
        String linkedAction = null;
        Long linkedTargetId = null;

        if (body.containsKey("linked_action")) {
            @SuppressWarnings("unchecked")
            var linkedActionMap = (Map<String, Object>) body.get("linked_action");
            linkedAction = (String) linkedActionMap.get("type");
            linkedTargetId = Long.valueOf(linkedActionMap.get("target_id").toString());
        }

        moderationService.resolveReport(id, admin, resolution, notes, linkedAction, linkedTargetId);
        return ResponseEntity.ok(Map.of("detail", "Report resolved"));
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<Map<String, Object>> getAnalyticsOverview(
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo) {
        var overview = new HashMap<String, Object>();

        // Total users (optionally filtered by date range)
        if (dateFrom != null || dateTo != null) {
            Instant from = dateFrom != null ? Instant.parse(dateFrom + "T00:00:00Z") : Instant.EPOCH;
            Instant to = dateTo != null ? Instant.parse(dateTo + "T23:59:59Z") : Instant.now();
            overview.put("total_users", userRepository.countByCreatedAtBetween(from, to));
            overview.put("total_active_listings", listingRepository.countActiveByCreatedAtBetween(from, to));
        } else {
            overview.put("total_users", userRepository.count());
            overview.put("total_active_listings", listingRepository.countActive());
        }

        overview.put("total_messages_sent", messageRepository.countAll());
        overview.put("total_reviews_submitted", reviewRepository.countActiveReviews());
        overview.put("platform_avg_rating", reviewRepository.getPlatformAverageRating());
        overview.put("pending_reports_count", reportRepository.countByStatus("pending"));

        // Listings by category
        var categoryCounts = listingRepository.countActiveListingsByCategory();
        var listingsByCategory = new java.util.ArrayList<Map<String, Object>>();
        for (var cc : categoryCounts) {
            var entry = new HashMap<String, Object>();
            entry.put("category_id", cc.getCategoryId());
            entry.put("category_name", cc.getCategoryName());
            entry.put("listing_count", cc.getListingCount());
            listingsByCategory.add(entry);
        }
        overview.put("listings_by_category", listingsByCategory);

        // Service vs product split
        var typeCounts = listingRepository.countActiveByListingType();
        var serviceProductSplit = new HashMap<String, Long>();
        for (var row : typeCounts) {
            serviceProductSplit.put((String) row[0], (Long) row[1]);
        }
        overview.put("service_product_split", serviceProductSplit);

        // Top providers/sellers
        var topProviders = new java.util.ArrayList<Map<String, Object>>();
        for (var u : userRepository.findTopProviders(Pageable.ofSize(5))) {
            var entry = new HashMap<String, Object>();
            entry.put("id", u.getId());
            entry.put("full_name", u.getFullName());
            entry.put("profile_photo_url", u.getProfilePhotoUrl());
            entry.put("avg_rating", u.getAvgRating());
            entry.put("rating_count", u.getRatingCount());
            entry.put("is_provider", u.isProvider());
            entry.put("is_seller", u.isSeller());
            entry.put("listing_count", listingRepository.countActiveByOwnerId(u.getId()));
            topProviders.add(entry);
        }
        overview.put("top_providers", topProviders);

        // Recent admin actions
        var recentActions = new java.util.ArrayList<Map<String, Object>>();
        for (var log : adminActionLogRepository.findTop10ByOrderByCreatedAtDesc()) {
            var entry = new HashMap<String, Object>();
            entry.put("id", log.getId());
            entry.put("admin_name", log.getAdmin().getFullName());
            entry.put("action", log.getAction());
            entry.put("target_type", log.getTargetType());
            entry.put("target_id", log.getTargetId());
            entry.put("notes", log.getNotes());
            entry.put("created_at", log.getCreatedAt().toString());
            recentActions.add(entry);
        }
        overview.put("recent_admin_actions", recentActions);

        // Top search terms
        var topSearchTerms = new java.util.ArrayList<Map<String, Object>>();
        for (var row : searchLogRepository.findTopSearchTerms(Pageable.ofSize(10))) {
            var entry = new HashMap<String, Object>();
            entry.put("query", row[0]);
            entry.put("count", row[1]);
            topSearchTerms.add(entry);
        }
        overview.put("top_search_terms", topSearchTerms);

        // New users this week (approximate)
        var oneWeekAgo = Instant.now().minusSeconds(7 * 24 * 60 * 60);
        overview.put("new_users_this_week", userRepository.countByCreatedAtAfter(oneWeekAgo));

        return ResponseEntity.ok(overview);
    }
}
