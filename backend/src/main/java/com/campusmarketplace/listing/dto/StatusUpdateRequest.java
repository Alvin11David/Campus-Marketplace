package com.campusmarketplace.listing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record StatusUpdateRequest(
    @NotBlank @Pattern(regexp = "active|paused|draft|deleted", message = "Status must be active, paused, draft, or deleted")
    String status
) {}
