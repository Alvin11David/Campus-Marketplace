package com.campusmarketplace.category.dto;

import com.campusmarketplace.category.Category;

public record CategoryWithCount(
    Long id,
    String name,
    String slug,
    String listingTypeHint,
    String iconName,
    String description,
    boolean active,
    long activeListingCount
) {
    public CategoryWithCount(Category cat, long count) {
        this(cat.getId(), cat.getName(), cat.getSlug(), cat.getListingTypeHint(), cat.getIconName(), cat.getDescription(), cat.isActive(), count);
    }
}
