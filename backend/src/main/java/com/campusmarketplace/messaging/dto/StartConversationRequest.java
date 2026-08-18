package com.campusmarketplace.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record StartConversationRequest(
    @NotNull Long listingId,
    @NotBlank @Size(min = 1, max = 1000) String initialMessage
) {}
