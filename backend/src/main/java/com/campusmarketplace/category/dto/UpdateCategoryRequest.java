package com.campusmarketplace.category.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateCategoryRequest(
    @NotBlank String name,
    @NotBlank String listingTypeHint,
    String description
) {}
