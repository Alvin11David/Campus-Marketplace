package com.campusmarketplace.listing;

import com.campusmarketplace.common.PageResponse;
import com.campusmarketplace.listing.dto.CreateListingRequest;
import com.campusmarketplace.listing.dto.ListingResponse;
import com.campusmarketplace.listing.dto.StatusUpdateRequest;
import com.campusmarketplace.listing.dto.UpdateListingRequest;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.User;
import jakarta.validation.Valid;
import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/listings")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ListingResponse>> listListings(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) Long campusLocationId,
        @RequestParam(required = false) String listingType,
        @RequestParam(required = false, defaultValue = "newest") String sortBy,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int pageSize) {
        return ResponseEntity.ok(listingService.searchListings(null, categoryId, minPrice, maxPrice,
            campusLocationId, listingType, sortBy, page, pageSize, null));
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<ListingResponse>> searchListings(
        @RequestParam String q,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) Long campusLocationId,
        @RequestParam(required = false) String listingType,
        @RequestParam(required = false, defaultValue = "newest") String sortBy,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int pageSize,
        @CurrentUser User currentUser) {
        return ResponseEntity.ok(listingService.searchListings(q, categoryId, minPrice, maxPrice,
            campusLocationId, listingType, sortBy, page, pageSize, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getListing(@PathVariable Long id,
                                                      @CurrentUser User currentUser) {
        return ResponseEntity.ok(listingService.getListingDetail(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<ListingResponse> createListing(@CurrentUser User user,
                                                         @Valid @RequestBody CreateListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(listingService.createListing(user, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ListingResponse> updateListing(@PathVariable Long id,
                                                         @CurrentUser User user,
                                                         @Valid @RequestBody UpdateListingRequest request) {
        return ResponseEntity.ok(listingService.updateListing(id, user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteListing(@PathVariable Long id, @CurrentUser User user) {
        listingService.deleteListing(id, user);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ListingResponse> toggleStatus(@PathVariable Long id,
                                                        @CurrentUser User user,
                                                        @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(listingService.toggleStatus(id, user, request));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<ListingResponse>> getMyListings(@CurrentUser User user) {
        return ResponseEntity.ok(listingService.getMyListings(user));
    }
}
