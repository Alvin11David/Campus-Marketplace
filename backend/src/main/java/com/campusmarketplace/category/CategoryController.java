package com.campusmarketplace.category;

import com.campusmarketplace.category.dto.CreateCategoryRequest;
import com.campusmarketplace.category.dto.UpdateCategoryRequest;
import com.campusmarketplace.common.ApiException;
import jakarta.validation.Valid;
import java.util.List;
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

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<Category>> listCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrue());
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
