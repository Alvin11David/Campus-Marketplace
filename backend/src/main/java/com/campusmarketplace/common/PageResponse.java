package com.campusmarketplace.common;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(
    long count,
    String next,
    String previous,
    List<T> results
) {
    public static <T> PageResponse<T> from(Page<?> page, List<T> content, String baseUrl) {
        String nextUrl = page.hasNext() ? buildPageUrl(baseUrl, page.nextPageable().getPageNumber()) : null;
        String prevUrl = page.hasPrevious() ? buildPageUrl(baseUrl, page.previousPageable().getPageNumber()) : null;
        return new PageResponse<>(page.getTotalElements(), nextUrl, prevUrl, content);
    }

    private static String buildPageUrl(String baseUrl, int pageNumber) {
        String separator = baseUrl.contains("?") ? "&" : "?";
        return baseUrl + separator + "page=" + pageNumber;
    }
}
