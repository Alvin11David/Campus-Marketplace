package com.campusmarketplace.recommendation;

import com.campusmarketplace.listing.Listing;
import com.campusmarketplace.listing.ListingImageRepository;
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
    private final ListingImageRepository listingImageRepository;

    public RecommendationController(RecommendationService recommendationService,
                                    ListingImageRepository listingImageRepository) {
        this.recommendationService = recommendationService;
        this.listingImageRepository = listingImageRepository;
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getRecommendations(
        @CurrentUser User user,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int pageSize) {
        var results = recommendationService.getRecommendations(user, page, pageSize);
        var response = results.stream().map(result -> {
            var images = listingImageRepository.findByListingIdOrderBySortOrderAsc(result.listing().getId());
            return ListingResponse.from(result.listing(), images.stream()
                .map(img -> new ListingResponse.ImageInfo(img.getId(), img.getImageUrl(), img.getSortOrder()))
                .toList());
        }).toList();
        return ResponseEntity.ok(response);
    }
}
