package com.campusmarketplace.moderation;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

import com.campusmarketplace.moderation.dto.ReportResponse;
import com.campusmarketplace.user.User;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

class ReportControllerTest {

    @Test
    void submitReportReturnsSafeResponsePayload() {
        ModerationService moderationService = mock(ModerationService.class);
        ReportController controller = new ReportController(moderationService);

        User reporter = new User("reporter@test.com", "encoded-password", "Reporter", "0771234567");
        reporter.setId(5L);

        Report report = new Report();
        report.setId(7L);
        report.setReporter(reporter);
        report.setTargetType("user");
        report.setTargetId(42L);
        report.setReason("scam");
        report.setDescription("Suspicious activity");
        report.setStatus("pending");

        given(moderationService.submitReport(any(), eq("user"), eq(42L), eq("scam"), eq("Suspicious activity")))
            .willReturn(report);

        ResponseEntity<?> response = controller.submitReport(reporter, Map.of(
            "target_type", "user",
            "target_id", 42L,
            "reason", "scam",
            "description", "Suspicious activity"
        ));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isInstanceOf(ReportResponse.class);

        ReportResponse body = (ReportResponse) response.getBody();
        assertThat(body.id()).isEqualTo(7L);
        assertThat(body.targetType()).isEqualTo("user");
        assertThat(body.targetId()).isEqualTo(42L);
        assertThat(body.reason()).isEqualTo("scam");
        assertThat(body.description()).isEqualTo("Suspicious activity");
        assertThat(body.reporterId()).isEqualTo(5L);
    }
}
