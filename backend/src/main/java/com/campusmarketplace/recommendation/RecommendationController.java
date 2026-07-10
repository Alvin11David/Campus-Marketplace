package com.campusmarketplace.recommendation;

import com.campusmarketplace.listing.dto.ListingResponse;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.User;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getRecommendations(
        @CurrentUser User user,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(recommendationService.getRecommendations(user, page, pageSize));
    }
}
