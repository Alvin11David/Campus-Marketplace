package com.campusmarketplace.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 2, max = 100) String fullName,
    String bio,
    @Pattern(regexp = "^(\\+256|0)[0-9]{9}$", message = "Must be a valid Uganda phone number") String phone,
    Long campusLocationId,
    String profilePhotoUrl
) {}
