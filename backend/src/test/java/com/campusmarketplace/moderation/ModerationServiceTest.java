package com.campusmarketplace.moderation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.notification.NotificationService;
import com.campusmarketplace.review.ReviewRepository;
import com.campusmarketplace.user.User;
import com.campusmarketplace.user.UserRepository;
import org.junit.jupiter.api.Test;

class ModerationServiceTest {

    @Test
    void submitReportAllowsReportsWhenTheTargetHasSeveralOpenReports() {
        ReportRepository reportRepository = mock(ReportRepository.class);
        AdminActionLogRepository adminActionLogRepository = mock(AdminActionLogRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        ListingRepository listingRepository = mock(ListingRepository.class);
        ReviewRepository reviewRepository = mock(ReviewRepository.class);
        NotificationService notificationService = mock(NotificationService.class);

        ModerationService moderationService = new ModerationService(
            reportRepository,
            adminActionLogRepository,
            userRepository,
            listingRepository,
            reviewRepository,
            notificationService
        );

        User reporter = new User("reporter@test.com", "encoded", "Reporter", "0770000000");
        reporter.setId(5L);

        Report savedReport = new Report();
        savedReport.setId(99L);

        given(reportRepository.countOpenReports(5L, "user", 42L)).willReturn(3L);
        given(reportRepository.save(any(Report.class))).willReturn(savedReport);

        Report report = moderationService.submitReport(reporter, "user", 42L, "scam", "Test detail");

        assertThat(report).isSameAs(savedReport);
    }
}
