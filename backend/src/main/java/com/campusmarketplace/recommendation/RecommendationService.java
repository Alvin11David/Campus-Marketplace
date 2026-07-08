package com.campusmarketplace.recommendation;

import com.campusmarketplace.category.CategoryRepository;
import com.campusmarketplace.listing.Listing;
import com.campusmarketplace.listing.ListingRepository;
import com.campusmarketplace.listing.ListingViewRepository;
import com.campusmarketplace.listing.SearchLogRepository;
import com.campusmarketplace.user.User;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class RecommendationService {

    private static final double RATING_WEIGHT = 0.4;
    private static final double LOCATION_WEIGHT = 0.3;
    private static final double PREFERENCE_WEIGHT = 0.3;

    private static final Map<String, java.util.Set<String>> ADJACENT_ZONES = Map.of(
        "central", java.util.Set.of("north", "south"),
        "north", java.util.Set.of("central"),
        "south", java.util.Set.of("central")
    );

    private final ListingRepository listingRepository;
    private final SearchLogRepository searchLogRepository;
    private final ListingViewRepository listingViewRepository;
    private final CategoryRepository categoryRepository;

    public RecommendationService(ListingRepository listingRepository,
                                 SearchLogRepository searchLogRepository,
                                 ListingViewRepository listingViewRepository,
                                 CategoryRepository categoryRepository) {
        this.listingRepository = listingRepository;
        this.searchLogRepository = searchLogRepository;
        this.listingViewRepository = listingViewRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<RecommendationResult> getRecommendations(User user, int page, int pageSize) {
        var candidates = listingRepository.findActiveListingsExcluding(user.getId());

        String userZone = user.getCampusLocation() != null ? user.getCampusLocation().getZone() : null;
        Map<Long, Long> categoryInteractions = getCategoryInteractionCounts(user);
        long totalInteractions = categoryInteractions.values().stream().mapToLong(l -> l).sum();
        long totalCategories = categoryRepository.countByIsActiveTrue();

        var scored = candidates.stream().map(listing -> {
            double ratingScore = ratingScore(listing.getOwner().getAvgRating());
            double locationScore = locationScore(userZone, listing.getCampusLocation().getZone());
            double preferenceScore = preferenceScore(
                categoryInteractions.getOrDefault(listing.getCategory().getId(), 0L),
                totalInteractions, totalCategories);

            double score = RATING_WEIGHT * ratingScore
                + LOCATION_WEIGHT * locationScore
                + PREFERENCE_WEIGHT * preferenceScore;

            return new RecommendationResult(listing, score);
        })
        .sorted((a, b) -> Double.compare(b.score(), a.score()))
        .skip((long) page * pageSize)
        .limit(pageSize)
        .toList();

        return scored;
    }

    private Map<Long, Long> getCategoryInteractionCounts(User user) {
        Map<Long, Long> counts = new HashMap<>();

        var searchCounts = searchLogRepository.countByUserGroupedByCategory(user.getId());
        for (var row : searchCounts) {
            Long catId = (Long) row[0];
            Long count = (Long) row[1];
            counts.merge(catId, count, Long::sum);
        }

        var viewCounts = listingViewRepository.countByUserGroupedByCategory(user.getId());
        for (var row : viewCounts) {
            Long catId = (Long) row[0];
            Long count = (Long) row[1];
            counts.merge(catId, count, Long::sum);
        }

        return counts;
    }

    static double ratingScore(BigDecimal avgRating) {
        if (avgRating == null) return 0.5;
        return avgRating.doubleValue() / 5.0;
    }

    static double locationScore(String userZone, String listingZone) {
        if (userZone == null) return 0.5;
        if (userZone.equals(listingZone)) return 1.0;
        if (ADJACENT_ZONES.getOrDefault(userZone, java.util.Set.of()).contains(listingZone)) return 0.5;
        return 0.0;
    }

    static double preferenceScore(long categoryInteractions, long totalInteractions, long totalCategories) {
        if (totalInteractions == 0) return 1.0 / totalCategories;
        return (double) categoryInteractions / totalInteractions;
    }

    public record RecommendationResult(Listing listing, double score) {}
}
