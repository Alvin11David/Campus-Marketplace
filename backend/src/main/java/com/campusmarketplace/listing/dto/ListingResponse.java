package com.campusmarketplace.listing.dto;

import com.campusmarketplace.listing.Listing;
import java.math.BigDecimal;
import java.util.List;

public record ListingResponse(
    Long id,
    String title,
    String slug,
    String listingType,
    CategoryInfo category,
    BigDecimal price,
    String currency,
    Integer stockQuantity,
    LocationInfo campusLocation,
    OwnerInfo owner,
    String primaryImageUrl,
    BigDecimal avgRating,
    int ratingCount,
    String status,
    String description,
    List<ImageInfo> images,
    int viewCount,
    int messageCount,
    String createdAt
) {
    public static ListingResponse from(Listing listing, List<ImageInfo> images) {
        return new ListingResponse(
            listing.getId(),
            listing.getTitle(),
            listing.getSlug(),
            listing.getListingType(),
            new CategoryInfo(listing.getCategory().getId(), listing.getCategory().getName()),
            listing.getPrice(),
            listing.getCurrency(),
            listing.getStockQuantity(),
            new LocationInfo(listing.getCampusLocation().getId(), listing.getCampusLocation().getName()),
            new OwnerInfo(listing.getOwner().getId(), listing.getOwner().getFullName(),
                listing.getOwner().getAvgRating(), listing.getOwner().getRatingCount()),
            images != null && !images.isEmpty() ? images.getFirst().imageUrl() : null,
            listing.getAvgRating(),
            listing.getRatingCount(),
            listing.getStatus(),
            listing.getDescription(),
            images,
            listing.getViewCount(),
            listing.getMessageCount(),
            listing.getCreatedAt() != null ? listing.getCreatedAt().toString() : null
        );
    }

    public record CategoryInfo(Long id, String name) {}
    public record LocationInfo(Long id, String name) {}
    public record OwnerInfo(Long id, String fullName, BigDecimal avgRating, int ratingCount) {}
    public record ImageInfo(Long id, String imageUrl, int sortOrder) {}
}
