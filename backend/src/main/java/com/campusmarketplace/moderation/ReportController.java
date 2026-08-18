package com.campusmarketplace.moderation;

import com.campusmarketplace.moderation.dto.ReportResponse;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.User;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    private final ModerationService moderationService;

    public ReportController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping
    public ResponseEntity<ReportResponse> submitReport(@CurrentUser User user,
                                                       @RequestBody Map<String, Object> body) {
        log.info("Received report submission for reporterId={}, body={}", user != null ? user.getId() : null, body);
        var report = moderationService.submitReport(
            user,
            (String) body.get("target_type"),
            Long.valueOf(body.get("target_id").toString()),
            (String) body.get("reason"),
            (String) body.get("description"));
        log.info("Report submission succeeded with reportId={}", report.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ReportResponse.from(report));
    }
}
