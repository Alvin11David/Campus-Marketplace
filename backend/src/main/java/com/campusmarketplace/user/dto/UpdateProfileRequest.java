package com.campusmarketplace.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 2, max = 100) String fullName,
    String bio,
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Must be a valid phone number (7-15 digits)") String phone,
    Long campusLocationId,
    String profilePhotoUrl
) {}
