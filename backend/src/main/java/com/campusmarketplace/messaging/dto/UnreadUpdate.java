package com.campusmarketplace.messaging.dto;

import java.time.Instant;

public record UnreadUpdate(
    Long conversationId,
    long unreadCount,
    String lastMessagePreview,
    Instant lastMessageAt
) {}
