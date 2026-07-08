package com.campusmarketplace.category;

import com.campusmarketplace.common.ApiException;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
}
