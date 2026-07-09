package com.campusmarketplace.user;

import com.campusmarketplace.security.CurrentUser;
import com.campusmarketplace.user.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
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
}
