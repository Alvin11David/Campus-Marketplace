package com.campusmarketplace.user.dto;

public record AuthResponse(
    UserProfileResponse user,
    String accessToken,
    String refreshToken
) {}
