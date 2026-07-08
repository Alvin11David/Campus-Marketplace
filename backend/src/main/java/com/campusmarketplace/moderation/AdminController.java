package com.campusmarketplace.moderation;

import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.listing.dto.ListingResponse;
import com.campusmarketplace.notification.NotificationRepository;
import com.campusmarketplace.review.ReviewRepository;
import com.campusmarketplace.user.UserRepository;
import com.campusmarketplace.user.dto.PublicProfileResponse;
import com.campusmarketplace.user.dto.UserProfileResponse;
import java.util.HashMap;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    private final NotificationRepository notificationRepository;
    private final com.campusmarketplace.listing.ListingImageRepository listingImageRepository;

    public AdminController(ModerationService moderationService, UserRepository userRepository,
                           ListingRepository listingRepository, ReviewRepository reviewRepository,
                           ReportRepository reportRepository, NotificationRepository notificationRepository,
                           com.campusmarketplace.listing.ListingImageRepository listingImageRepository) {
        this.moderationService = moderationService;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.reviewRepository = reviewRepository;
        this.reportRepository = reportRepository;
        this.notificationRepository = notificationRepository;
        this.listingImageRepository = listingImageRepository;
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
        overview.put("total_users", userRepository.count());
        overview.put("total_active_listings", listingRepository.countActive());
        overview.put("total_messages_sent", 0L);
        overview.put("total_reviews_submitted", 0L);

        var listingsByCategory = new java.util.ArrayList<Map<String, Object>>();
        var categories = com.campusmarketplace.category.CategoryRepository.class;
        overview.put("listings_by_category", listingsByCategory);
        overview.put("platform_avg_rating", 0.0);

        return ResponseEntity.ok(overview);
    }
}
