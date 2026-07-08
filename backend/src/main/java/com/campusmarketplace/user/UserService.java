package com.campusmarketplace.user;

import com.campusmarketplace.common.ApiException;
import com.campusmarketplace.email.EmailService;
import com.campusmarketplace.location.CampusLocation;
import com.campusmarketplace.location.CampusLocationRepository;
import com.campusmarketplace.security.JwtTokenProvider;
import com.campusmarketplace.user.dto.*;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CampusLocationRepository campusLocationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Set<String> blacklistedTokens = new HashSet<>();

    public UserService(UserRepository userRepository, CampusLocationRepository campusLocationRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager, EmailService emailService,
                       PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.campusLocationRepository = campusLocationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.emailService = emailService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.password().equals(request.passwordConfirmation())) {
            throw ApiException.badRequest("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("An account with this email already exists");
        }

        var user = new User(request.email(), passwordEncoder.encode(request.password()),
            request.fullName(), request.phone());
        user = userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(UserProfileResponse.from(user), accessToken, refreshToken);
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        var userOpt = userRepository.findByEmail(request.email());

        if (userOpt.isPresent()) {
            var user = userOpt.get();
            passwordResetTokenRepository.deleteByUserId(user.getId());

            String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
            var token = new PasswordResetToken(user, otp, Instant.now().plusSeconds(900));
            passwordResetTokenRepository.save(token);

            emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
        }

        return new MessageResponse("If an account with that email exists, a reset code has been sent.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.passwordConfirmation())) {
            throw ApiException.badRequest("Passwords do not match");
        }

        var user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> ApiException.badRequest("Invalid or expired reset code"));

        var token = passwordResetTokenRepository
            .findByUserIdAndOtpAndUsedFalse(user.getId(), request.otp())
            .orElseThrow(() -> ApiException.badRequest("Invalid or expired reset code"));

        if (!token.isValid()) {
            throw ApiException.badRequest("Reset code has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        return new MessageResponse("Password has been reset successfully.");
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException e) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        var user = userRepository.findByEmailWithLocation(request.email())
            .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (user.isSuspended()) {
            throw ApiException.forbidden("Your account has been suspended. Contact support.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return new AuthResponse(UserProfileResponse.from(user), accessToken, refreshToken);
    }

    public RefreshTokenResponse refresh(RefreshTokenRequest request) {
        if (blacklistedTokens.contains(request.refreshToken())) {
            throw ApiException.unauthorized("Refresh token has been revoked");
        }
        if (!jwtTokenProvider.validateToken(request.refreshToken())) {
            throw ApiException.unauthorized("Invalid or expired refresh token");
        }
        Long userId = jwtTokenProvider.getUserIdFromToken(request.refreshToken());
        var user = userRepository.findById(userId)
            .orElseThrow(() -> ApiException.unauthorized("User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(userId, user.getEmail());
        return new RefreshTokenResponse(newAccessToken);
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && jwtTokenProvider.validateToken(refreshToken)) {
            blacklistedTokens.add(refreshToken);
        }
    }

    public UserProfileResponse getMyProfile(User user) {
        var fullUser = userRepository.findByIdWithLocation(user.getId())
            .orElseThrow(() -> ApiException.notFound("User not found"));
        return UserProfileResponse.from(fullUser);
    }

    public PublicProfileResponse getPublicProfile(Long id) {
        var user = userRepository.findByIdWithLocation(id)
            .orElseThrow(() -> ApiException.notFound("This profile is no longer available"));

        if (!user.isActive() || user.isSuspended()) {
            throw ApiException.notFound("This profile is no longer available");
        }

        return PublicProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        var user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> ApiException.notFound("User not found"));

        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.phone() != null) user.setPhone(request.phone());
        if (request.profilePhotoUrl() != null) user.setProfilePhotoUrl(request.profilePhotoUrl());
        if (request.campusLocationId() != null) {
            var location = campusLocationRepository.findById(request.campusLocationId())
                .orElseThrow(() -> ApiException.badRequest("Campus location not found"));
            user.setCampusLocation(location);
        }

        user = userRepository.save(user);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse toggleRoles(User currentUser, RoleToggleRequest request) {
        var user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> ApiException.notFound("User not found"));

        if (request.isProvider() != null) user.setProvider(request.isProvider());
        if (request.isSeller() != null) user.setSeller(request.isSeller());

        user = userRepository.save(user);
        return UserProfileResponse.from(user);
    }

    @Transactional
    public void deactivate(User currentUser, DeactivateRequest request) {
        if (!passwordEncoder.matches(request.password(), currentUser.getPassword())) {
            throw ApiException.badRequest("Incorrect password");
        }
        var user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }
}
