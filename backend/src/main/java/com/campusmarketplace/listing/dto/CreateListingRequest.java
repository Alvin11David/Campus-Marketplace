package com.campusmarketplace.listing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record CreateListingRequest(
    @NotBlank @Size(min = 5, max = 100) String title,
    @NotBlank @Size(min = 20, max = 1000) String description,
    @NotBlank String listingType,
    @NotNull Long categoryId,
    @NotNull @DecimalMin("0.01") BigDecimal price,
    String currency,
    Integer stockQuantity,
    @NotNull Long campusLocationId,
    List<String> imageUrls
) {}
