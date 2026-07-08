package com.campusmarketplace.user.dto;

import com.campusmarketplace.user.User;
import java.math.BigDecimal;

public record UserProfileResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    String bio,
    String profilePhotoUrl,
    LocationInfo campusLocation,
    boolean isProvider,
    boolean isSeller,
    boolean isAdmin,
    boolean isVerified,
    BigDecimal avgRating,
    int ratingCount,
    String joinDate
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getBio(),
            user.getProfilePhotoUrl(),
            user.getCampusLocation() != null
                ? new LocationInfo(user.getCampusLocation().getId(), user.getCampusLocation().getName())
                : null,
            user.isProvider(),
            user.isSeller(),
            user.isAdmin(),
            user.isVerified(),
            user.getAvgRating(),
            user.getRatingCount(),
            user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }

    public record LocationInfo(Long id, String name) {}
}
