package com.campusmarketplace.user.dto;

public record RoleToggleRequest(
    Boolean isProvider,
    Boolean isSeller
) {}
