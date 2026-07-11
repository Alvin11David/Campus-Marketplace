package com.campusmarketplace.moderation.dto;

import com.campusmarketplace.moderation.Report;
import java.time.Instant;

public record ReportResponse(
    Long id,
    Long reporterId,
    String targetType,
    Long targetId,
    String reason,
    String description,
    String status,
    Instant createdAt
) {
    public static ReportResponse from(Report report) {
        return new ReportResponse(
            report.getId(),
            report.getReporter() != null ? report.getReporter().getId() : null,
            report.getTargetType(),
            report.getTargetId(),
            report.getReason(),
            report.getDescription(),
            report.getStatus(),
            report.getCreatedAt()
        );
    }
}
