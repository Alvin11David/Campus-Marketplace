package com.campusmarketplace.category;

import com.campusmarketplace.category.dto.CreateCategoryRequest;
import com.campusmarketplace.category.dto.CategoryWithCount;
import com.campusmarketplace.category.dto.UpdateCategoryRequest;
import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.listing.ListingRepository;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ListingRepository listingRepository;

    public CategoryController(CategoryRepository categoryRepository, ListingRepository listingRepository) {
        this.categoryRepository = categoryRepository;
        this.listingRepository = listingRepository;
    }

    @GetMapping
    public ResponseEntity<List<CategoryWithCount>> listCategories() {
        var categories = categoryRepository.findByIsActiveTrue();
        var counts = listingRepository.countActiveListingsByCategory()
            .stream()
            .collect(Collectors.toMap(
                com.campusmarketplace.listing.CategoryListingCount::getCategoryId,
                com.campusmarketplace.listing.CategoryListingCount::getListingCount
            ));
        var result = categories.stream()
            .map(cat -> new CategoryWithCount(cat, counts.getOrDefault(cat.getId(), 0L)))
            .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<Category> getCategory(@PathVariable String slug) {
        var category = categoryRepository.findBySlug(slug)
            .orElseThrow(() -> ApiException.notFound("Category not found"));
        if (!category.isActive()) {
            throw ApiException.notFound("Category not found");
        }
        return ResponseEntity.ok(category);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        if (categoryRepository.findByName(request.name()).isPresent()) {
            throw ApiException.conflict("A category with the name '" + request.name() + "' already exists");
        }
        String baseSlug = request.name().toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        String slug = baseSlug + "-" + System.currentTimeMillis();

        var category = new Category(request.name(), slug, request.listingTypeHint(), "Package");
        category = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id,
                                                    @Valid @RequestBody UpdateCategoryRequest request) {
        var category = categoryRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Category not found"));
        category.setName(request.name());
        String baseSlug = request.name().toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        category.setSlug(baseSlug + "-" + System.currentTimeMillis());
        category.setListingTypeHint(request.listingTypeHint());
        category.setDescription(request.description());
        category = categoryRepository.save(category);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> retireCategory(@PathVariable Long id) {
        var category = categoryRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Category not found"));
        category.setActive(false);
        categoryRepository.save(category);
        return ResponseEntity.noContent().build();
    }
}
