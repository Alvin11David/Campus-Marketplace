package com.campusmarketplace.messaging.dto;

import com.campusmarketplace.messaging.Message;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;

public record MessageResponse(
    Long id,
    Long senderId,
    @JsonProperty("content") String body,
    boolean isRead,
    Instant createdAt
) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(
            message.getId(),
            message.getSender().getId(),
            message.getBody(),
            message.isRead(),
            message.getCreatedAt()
        );
    }
}
