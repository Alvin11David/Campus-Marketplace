package com.campusmarketplace.user;

import com.campusmarketplace.listing.ListingService;
import com.campusmarketplace.listing.dto.ListingResponse;
import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.dto.*;
import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;
    private final ListingService listingService;

    public UserController(UserService userService, ListingService listingService) {
        this.userService = userService;
        this.listingService = listingService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }

    @PostMapping("/auth/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(userService.forgotPassword(request));
    }

    @PostMapping("/auth/verify-otp")
    public ResponseEntity<MessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(userService.verifyOtp(request));
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(userService.resetPassword(request));
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<RefreshTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(userService.refresh(request));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout(@CurrentUser User user,
                                       @RequestBody(required = false) RefreshTokenRequest request) {
        if (request != null) {
            userService.logout(request.refreshToken());
        }
        return ResponseEntity.status(HttpStatus.RESET_CONTENT).build();
    }

    @GetMapping("/auth/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@CurrentUser User user) {
        return ResponseEntity.ok(userService.getMyProfile(user));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }

    @GetMapping("/users/{userId}/listings")
    public ResponseEntity<List<ListingResponse>> getUserListings(@PathVariable Long userId) {
        return ResponseEntity.ok(listingService.getUserListings(userId));
    }

    @PatchMapping("/users/me")
    public ResponseEntity<UserProfileResponse> updateProfile(@CurrentUser User user,
                                                             @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @PatchMapping("/users/me/roles")
    public ResponseEntity<UserProfileResponse> toggleRoles(@CurrentUser User user,
                                                           @Valid @RequestBody RoleToggleRequest request) {
        return ResponseEntity.ok(userService.toggleRoles(user, request));
    }

    @PostMapping("/users/me/deactivate")
    public ResponseEntity<MessageResponse> deactivate(@CurrentUser User user,
                                                       @Valid @RequestBody DeactivateRequest request) {
        userService.deactivate(user, request);
        return ResponseEntity.ok(new MessageResponse("Account deactivated."));
    }

    @PostMapping("/users/me/photo")
    public ResponseEntity<UserProfileResponse> uploadPhoto(@CurrentUser User user,
                                                           @RequestParam("file") MultipartFile file) {
        try {
            String uploadDir = "uploads/photos";
            Files.createDirectories(Paths.get(uploadDir));
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, filename);
            Files.copy(file.getInputStream(), filePath);
            String photoUrl = "/" + uploadDir + "/" + filename;
            return ResponseEntity.ok(userService.updatePhoto(user, photoUrl));
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload photo", e);
        }
    }
}
