package com.campusmarketplace.moderation;

import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.notification.NotificationService;
import com.campusmarketplace.review.ReviewRepository;
import com.campusmarketplace.user.User;
import com.campusmarketplace.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ModerationService {

    private final ReportRepository reportRepository;
    private final AdminActionLogRepository adminActionLogRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;

    public ModerationService(ReportRepository reportRepository,
                             AdminActionLogRepository adminActionLogRepository,
                             UserRepository userRepository, ListingRepository listingRepository,
                             ReviewRepository reviewRepository, NotificationService notificationService) {
        this.reportRepository = reportRepository;
        this.adminActionLogRepository = adminActionLogRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Report submitReport(User reporter, String targetType, Long targetId,
                               String reason, String description) {
        long openReports = reportRepository.countOpenReports(reporter.getId(), targetType, targetId);
        if (openReports >= 3) {
            throw ApiException.badRequest("You have too many open reports on this target");
        }

        var report = new Report();
        report.setReporter(reporter);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setDescription(description);
        return reportRepository.save(report);
    }

    @Transactional
    public void suspendUser(Long userId, User admin, String reason) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setSuspended(true);
        userRepository.save(user);

        adminActionLogRepository.save(new AdminActionLog(admin, "suspend_user", "user", userId, reason));
        notificationService.notify(user, "admin_action", "Account Suspended",
            "Your account has been suspended. Reason: " + reason, null, null);
    }

    @Transactional
    public void reactivateUser(Long userId, User admin) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setSuspended(false);
        userRepository.save(user);

        adminActionLogRepository.save(new AdminActionLog(admin, "reactivate_user", "user", userId, null));
        notificationService.notify(user, "admin_action", "Account Reactivated",
            "Your account has been reactivated.", null, null);
    }

    @Transactional
    public void deactivateListing(Long listingId, User admin, String reason) {
        var listing = listingRepository.findById(listingId)
            .orElseThrow(() -> ApiException.notFound("Listing not found"));
        listing.setStatus("deleted");
        listingRepository.save(listing);

        adminActionLogRepository.save(new AdminActionLog(admin, "deactivate_listing", "listing", listingId, reason));
        notificationService.notify(listing.getOwner(), "listing_status_change",
            "Listing Deactivated",
            "Your listing '" + listing.getTitle() + "' has been deactivated. Reason: " + reason,
            "listing", listingId);
    }

    @Transactional
    public void deleteReview(Long reviewId, User admin, String reason) {
        var review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> ApiException.notFound("Review not found"));
        review.setDeleted(true);
        reviewRepository.save(review);

        adminActionLogRepository.save(new AdminActionLog(admin, "delete_review", "review", reviewId, reason));
        notificationService.notify(review.getReviewer(), "admin_action",
            "Review Removed",
            "Your review has been removed. Reason: " + reason, null, null);
    }

    @Transactional
    public Report resolveReport(Long reportId, User admin, String resolution,
                                String resolutionNotes, String linkedActionType, Long linkedTargetId) {
        var report = reportRepository.findById(reportId)
            .orElseThrow(() -> ApiException.notFound("Report not found"));

        report.setStatus("resolved".equals(resolution) ? "resolved" : "dismissed");
        report.setResolvedBy(admin);
        report.setResolutionNotes(resolutionNotes);
        report.setResolvedAt(java.time.Instant.now());
        report = reportRepository.save(report);

        if (linkedActionType != null && linkedTargetId != null) {
            adminActionLogRepository.save(new AdminActionLog(admin, linkedActionType,
                report.getTargetType(), linkedTargetId, resolutionNotes));
        }

        notificationService.notify(report.getReporter(), "report_resolved",
            "Report Resolved",
            "Your report has been reviewed and " + resolution + ". " + resolutionNotes,
            null, null);

        return report;
    }
}
