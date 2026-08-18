package com.campusmarketplace.common;

import java.util.Map;

public record ErrorResponse(
    String detail,
    Map<String, java.util.List<String>> errors
) {
    public ErrorResponse(String detail) {
        this(detail, null);
    }
}
