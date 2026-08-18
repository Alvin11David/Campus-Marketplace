package com.campusmarketplace.messaging.dto;

import com.campusmarketplace.messaging.Conversation;
import java.time.Instant;

public record ConversationResponse(
    Long id,
    ListingSummary listing,
    ParticipantInfo otherParticipant,
    Instant lastMessageAt,
    long unreadCount,
    String lastMessagePreview,
    Instant createdAt
) {
    public static ConversationResponse from(Conversation conv, Long currentUserId,
                                            long unreadCount, String lastMessagePreview) {
        var otherUser = conv.getInitiator().getId().equals(currentUserId)
            ? conv.getRecipient() : conv.getInitiator();

        return new ConversationResponse(
            conv.getId(),
            conv.getListing() != null
                ? new ListingSummary(conv.getListing().getId(), conv.getListing().getTitle())
                : null,
            new ParticipantInfo(otherUser.getId(), otherUser.getFullName(), otherUser.getProfilePhotoUrl()),
            conv.getLastMessageAt(),
            unreadCount,
            lastMessagePreview,
            conv.getCreatedAt()
        );
    }

    public record ListingSummary(Long id, String title) {}
    public record ParticipantInfo(Long id, String fullName, String profilePhotoUrl) {}
}
