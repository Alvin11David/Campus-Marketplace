package com.campusmarketplace.category;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "listing_type_hint", nullable = false, length = 10)
    private String listingTypeHint;

    @Column(name = "icon_name", length = 50)
    private String iconName;

    @Column(length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    public Category() {}

    public Category(String name, String slug, String listingTypeHint, String iconName) {
        this.name = name;
        this.slug = slug;
        this.listingTypeHint = listingTypeHint;
        this.iconName = iconName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getListingTypeHint() { return listingTypeHint; }
    public void setListingTypeHint(String listingTypeHint) { this.listingTypeHint = listingTypeHint; }
    public String getIconName() { return iconName; }
    public void setIconName(String iconName) { this.iconName = iconName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
