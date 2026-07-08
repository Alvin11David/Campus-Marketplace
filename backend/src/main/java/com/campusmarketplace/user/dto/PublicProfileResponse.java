package com.campusmarketplace.user.dto;

import com.campusmarketplace.user.User;
import java.math.BigDecimal;

public record PublicProfileResponse(
    Long id,
    String fullName,
    String profilePhotoUrl,
    String bio,
    UserProfileResponse.LocationInfo campusLocation,
    boolean isProvider,
    boolean isSeller,
    boolean isVerified,
    BigDecimal avgRating,
    int ratingCount
) {
    public static PublicProfileResponse from(User user) {
        return new PublicProfileResponse(
            user.getId(),
            user.getFullName(),
            user.getProfilePhotoUrl(),
            user.getBio(),
            user.getCampusLocation() != null
                ? new UserProfileResponse.LocationInfo(user.getCampusLocation().getId(), user.getCampusLocation().getName())
                : null,
            user.isProvider(),
            user.isSeller(),
            user.isVerified(),
            user.getAvgRating(),
            user.getRatingCount()
        );
    }
}
