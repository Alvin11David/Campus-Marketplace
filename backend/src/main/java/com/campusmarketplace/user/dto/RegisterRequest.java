package com.campusmarketplace.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(min = 2, max = 100) String fullName,
    @NotBlank @Email String email,
    @NotBlank @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Must be a valid phone number (7-15 digits)") String phone,
    @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
    @NotBlank String passwordConfirmation
) {}
