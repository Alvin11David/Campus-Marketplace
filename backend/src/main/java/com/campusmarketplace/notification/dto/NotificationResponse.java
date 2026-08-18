package com.campusmarketplace.notification.dto;

import com.campusmarketplace.notification.Notification;
import java.time.Instant;

public record NotificationResponse(
    Long id,
    String notifType,
    String title,
    String body,
    String relatedType,
    Long relatedId,
    boolean isRead,
    boolean isArchived,
    Instant createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
            n.getId(), n.getNotifType(), n.getTitle(), n.getBody(),
            n.getRelatedType(), n.getRelatedId(), n.isRead(), n.isArchived(), n.getCreatedAt()
        );
    }
}
