package com.campusmarketplace.user.dto;

import com.campusmarketplace.user.User;
import java.math.BigDecimal;

public record PublicProfileResponse(
    Long id,
    String fullName,
    String email,
    String profilePhotoUrl,
    String bio,
    UserProfileResponse.LocationInfo campusLocation,
    boolean isProvider,
    boolean isSeller,
    boolean isAdmin,
    boolean isVerified,
    boolean isActive,
    boolean isSuspended,
    BigDecimal avgRating,
    int ratingCount,
    String createdAt
) {
    public static PublicProfileResponse from(User user) {
        return new PublicProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getProfilePhotoUrl(),
            user.getBio(),
            user.getCampusLocation() != null
                ? new UserProfileResponse.LocationInfo(user.getCampusLocation().getId(), user.getCampusLocation().getName())
                : null,
            user.isProvider(),
            user.isSeller(),
            user.isAdmin(),
            user.isVerified(),
            user.isActive(),
            user.isSuspended(),
            user.getAvgRating(),
            user.getRatingCount(),
            user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }
}
