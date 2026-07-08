package com.campusmarketplace.listing.dto;

import java.math.BigDecimal;

public record UpdateListingRequest(
    String title,
    String description,
    BigDecimal price,
    String currency,
    Integer stockQuantity,
    Long categoryId,
    Long campusLocationId
) {}
