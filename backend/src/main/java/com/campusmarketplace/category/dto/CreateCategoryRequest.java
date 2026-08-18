package com.campusmarketplace.category.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryRequest(
    @NotBlank String name,
    @NotBlank String listingTypeHint
) {}