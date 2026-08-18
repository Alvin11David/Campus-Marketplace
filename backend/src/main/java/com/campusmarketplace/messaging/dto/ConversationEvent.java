package com.campusmarketplace.messaging.dto;

public record ConversationEvent(
    String type,
    Long conversationId,
    Object data
) {}
