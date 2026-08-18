package com.campusmarketplace.user.dto;

import jakarta.validation.constraints.NotBlank;

public record DeactivateRequest(
    @NotBlank String password,
    String reason
) {}
