package com.campusmarketplace.listing;

import com.campusmarketplace.category.CategoryRepository;
import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.common.PageResponse;
import com.campusmarketplace.listing.dto.CreateListingRequest;
import com.campusmarketplace.listing.dto.ListingResponse;
import com.campusmarketplace.listing.dto.StatusUpdateRequest;
import com.campusmarketplace.listing.dto.UpdateListingRequest;
import com.campusmarketplace.location.CampusLocationRepository;
import com.campusmarketplace.user.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingImageRepository listingImageRepository;
    private final SearchLogRepository searchLogRepository;
    private final ListingViewRepository listingViewRepository;
    private final CategoryRepository categoryRepository;
    private final CampusLocationRepository campusLocationRepository;

    public ListingService(ListingRepository listingRepository, ListingImageRepository listingImageRepository,
                          SearchLogRepository searchLogRepository, ListingViewRepository listingViewRepository,
                          CategoryRepository categoryRepository, CampusLocationRepository campusLocationRepository) {
        this.listingRepository = listingRepository;
        this.listingImageRepository = listingImageRepository;
        this.searchLogRepository = searchLogRepository;
        this.listingViewRepository = listingViewRepository;
        this.categoryRepository = categoryRepository;
        this.campusLocationRepository = campusLocationRepository;
    }

    @Transactional
    public ListingResponse createListing(User owner, CreateListingRequest request) {
        if ("service".equals(request.listingType()) && !owner.isProvider()) {
            throw ApiException.forbidden("Enable Provider mode in your profile first");
        }
        if ("product".equals(request.listingType()) && !owner.isSeller()) {
            throw ApiException.forbidden("Enable Seller mode in your profile first");
        }

        var category = categoryRepository.findById(request.categoryId())
            .orElseThrow(() -> ApiException.badRequest("Category not found"));
        var campusLocation = campusLocationRepository.findById(request.campusLocationId())
            .orElseThrow(() -> ApiException.badRequest("Campus location not found"));

        if ("product".equals(request.listingType()) && request.stockQuantity() == null) {
            throw ApiException.badRequest("Stock quantity is required for product listings");
        }

        var listing = new Listing();
        listing.setOwner(owner);
        listing.setCategory(category);
        listing.setListingType(request.listingType());
        listing.setTitle(request.title());
        listing.setSlug(generateSlug(request.title()));
        listing.setDescription(request.description());
        listing.setPrice(request.price());
        listing.setCurrency(request.currency() != null ? request.currency() : "UGX");
        listing.setStockQuantity(request.stockQuantity());
        listing.setCampusLocation(campusLocation);
        listing = listingRepository.save(listing);

        if (request.imageUrls() != null) {
            for (int i = 0; i < Math.min(request.imageUrls().size(), 5); i++) {
                listingImageRepository.save(new ListingImage(listing, request.imageUrls().get(i), i));
            }
        }

        var images = listingImageRepository.findByListingIdOrderBySortOrderAsc(listing.getId());
        return ListingResponse.from(listing, images.stream()
            .map(img -> new ListingResponse.ImageInfo(img.getId(), img.getImageUrl(), img.getSortOrder()))
            .toList());
    }

    public PageResponse<ListingResponse> searchListings(String query, Long categoryId,
                                                         BigDecimal minPrice, BigDecimal maxPrice,
                                                         Long campusLocationId, String listingType,
                                                         String sortBy, int page, int pageSize, User currentUser) {
        if (query != null && query.length() < 2) {
            throw ApiException.badRequest("Query must be at least 2 characters");
        }

        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(page, pageSize, sort);

        Page<Listing> listingPage = listingRepository.searchListings(
            query, categoryId, minPrice, maxPrice, campusLocationId, listingType, pageable);

        if (query != null && currentUser != null) {
            searchLogRepository.save(new SearchLog(currentUser, query,
                categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null));
        }

        return mapToListingPageResponse(listingPage, null);
    }

    public ListingResponse getListingDetail(Long id, User currentUser) {
        var listing = listingRepository.findByIdWithDetails(id)
            .orElseThrow(() -> ApiException.notFound("Listing not found"));

        boolean isOwner = currentUser != null && listing.getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser != null && currentUser.isAdmin();

        if (!"active".equals(listing.getStatus()) && !isOwner && !isAdmin) {
            throw ApiException.notFound("This listing is no longer available");
        }

        if (currentUser != null && !isOwner) {
            listingViewRepository.save(new ListingView(currentUser, listing));
            listingRepository.incrementViewCount(id);
        }

        var images = listingImageRepository.findByListingIdOrderBySortOrderAsc(listing.getId());
        return ListingResponse.from(listing, images.stream()
            .map(img -> new ListingResponse.ImageInfo(img.getId(), img.getImageUrl(), img.getSortOrder()))
            .toList());
    }

    public PageResponse<ListingResponse> getCategoryListings(Long categoryId, String sortBy,
                                                              int page, int pageSize) {
        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        var listingPage = listingRepository.findByCategoryId(categoryId, pageable);
        return mapToListingPageResponse(listingPage, null);
    }

    public List<ListingResponse> getMyListings(User owner) {
        var listings = listingRepository.findByOwnerId(owner.getId());
        return listings.stream().map(listing -> {
            var images = listingImageRepository.findByListingIdOrderBySortOrderAsc(listing.getId());
            return ListingResponse.from(listing, images.stream()
                .map(img -> new ListingResponse.ImageInfo(img.getId(), img.getImageUrl(), img.getSortOrder()))
                .toList());
        }).toList();
    }

    @Transactional
    public ListingResponse updateListing(Long id, User currentUser, UpdateListingRequest request) {
        var listing = listingRepository.findByIdWithDetails(id)
            .orElseThrow(() -> ApiException.notFound("Listing not found"));

        if (!listing.getOwner().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw ApiException.forbidden("You do not have permission to edit this listing");
        }

        if (request.title() != null) {
            listing.setTitle(request.title());
            listing.setSlug(generateSlug(request.title()));
        }
        if (request.description() != null) listing.setDescription(request.description());
        if (request.price() != null) listing.setPrice(request.price());
        if (request.currency() != null) listing.setCurrency(request.currency());
        if (request.stockQuantity() != null) listing.setStockQuantity(request.stockQuantity());
        if (request.categoryId() != null) {
            var category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> ApiException.badRequest("Category not found"));
            listing.setCategory(category);
        }
        if (request.campusLocationId() != null) {
            var location = campusLocationRepository.findById(request.campusLocationId())
                .orElseThrow(() -> ApiException.badRequest("Campus location not found"));
            listing.setCampusLocation(location);
        }

        listing = listingRepository.save(listing);
        var images = listingImageRepository.findByListingIdOrderBySortOrderAsc(listing.getId());
        return ListingResponse.from(listing, images.stream()
            .map(img -> new ListingResponse.ImageInfo(img.getId(), img.getImageUrl(), img.getSortOrder()))
            .toList());
    }

    @Transactional
    public void deleteListing(Long id, User currentUser) {
        var listing = listingRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("Listing not found"));

        if (!listing.getOwner().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw ApiException.forbidden("You do not have permission to delete this listing");
        }

        listing.setStatus("deleted");
        listingRepository.save(listing);
    }

    @Transactional
    public ListingResponse toggleStatus(Long id, User currentUser, StatusUpdateRequest request) {
        var listing = listingRepository.findByIdWithDetails(id)
            .orElseThrow(() -> ApiException.notFound("Listing not found"));

        if (!listing.getOwner().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw ApiException.forbidden("You do not have permission to modify this listing");
        }

        listing.setStatus(request.status());
        listing = listingRepository.save(listing);
        var images = listingImageRepository.findByListingIdOrderBySortOrderAsc(listing.getId());
        return ListingResponse.from(listing, images.stream()
            .map(img -> new ListingResponse.ImageInfo(img.getId(), img.getImageUrl(), img.getSortOrder()))
            .toList());
    }

    public PageResponse<ListingResponse> getAllListings(String sortBy, int page, int pageSize) {
        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(page, pageSize, sort);
        var listingPage = listingRepository.searchListings(null, null, null, null, null, null, pageable);
        return mapToListingPageResponse(listingPage, null);
    }

    private Sort resolveSort(String sortBy) {
        return switch (sortBy != null ? sortBy : "newest") {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating_desc" -> Sort.by(Sort.Direction.DESC, "avgRating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private String generateSlug(String title) {
        String base = title.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
        String slug = base;
        int suffix = 1;
        while (listingRepository.findByIdWithDetails(0L).isPresent()) {
            slug = base + "-" + suffix++;
        }
        return slug + "-" + System.currentTimeMillis();
    }

    private PageResponse<ListingResponse> mapToListingPageResponse(Page<Listing> page, String baseUrl) {
        var content = page.getContent().stream().map(listing -> {
            var images = listingImageRepository.findByListingIdOrderBySortOrderAsc(listing.getId());
            return ListingResponse.from(listing, images.stream()
                .map(img -> new ListingResponse.ImageInfo(img.getId(), img.getImageUrl(), img.getSortOrder()))
                .toList());
        }).toList();
        return PageResponse.from(page, content, baseUrl);
    }
}
