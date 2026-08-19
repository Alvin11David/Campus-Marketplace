## 1. Complete API Reference — all 59 endpoints

All endpoints are mounted under the servlet context by Spring MVC `@RequestMapping` annotations found directly in each controller class (`backend/src/main/java/com/campusmarketplace/**/*Controller.java`). Authentication requirements below are taken **literally** from `backend/src/main/java/com/campusmarketplace/security/SecurityConfig.java` — not inferred from controller code — and cross-checked against `@CurrentUser`/`@PreAuthorize` usage in each controller/service. Two important, verified facts apply globally and are not repeated in every row:

- **Error envelope**: every error response (validation failure, `ApiException`, `AccessDeniedException`, or any uncaught exception) is a JSON body shaped by `common/ErrorResponse.java`: `{ "detail": string, "errors": { [field]: string[] } | null }`. Handling is centralized in `common/GlobalExceptionHandler.java`:
  - `ApiException` → the status carried on the exception (see `common/ApiException.java`: `notFound`→404, `badRequest`→400, `conflict`→409, `forbidden`→403, `unauthorized`→401)
  - `MethodArgumentNotValidException` (a `@Valid` field failed) → 400, with per-field messages in `errors`
  - `AccessDeniedException` (Spring Security `@PreAuthorize` failure) → 403, `detail: "You do not have permission to perform this action"`
  - Any other uncaught `Exception` → 500, `detail: "ERR: <ExceptionClassSimpleName> - <message>"`
- **Two different pagination envelopes exist side by side** (a verified inconsistency, not a documentation simplification):
  - `common/PageResponse.java` — used by `ListingController` and `NotificationController` — is `{ count, next, previous, results }`. `next`/`previous` are **always `null` in this codebase** because every call site (`ListingService`, `NotificationController`) passes `baseUrl = null` into `PageResponse.from(page, content, baseUrl)`, and `PageResponse.from` only builds a link when `baseUrl != null`. Clients must page via `page`/`pageSize` query params themselves.
  - Spring Data's native `Page<T>` JSON shape — used by `ReviewController` (`getListingReviews`, `getUserReviews`) and `AdminController` (`listUsers`, `listReports`) — serializes as `{ content, pageable, totalPages, totalElements, size, number, sort, numberOfElements, first, last, empty }`.

### 1.1 UserController (`/api/v1`) — 14 endpoints

Source: `backend/src/main/java/com/campusmarketplace/user/UserController.java`, `UserService.java`, `user/dto/*.java`.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `POST /api/v1/auth/register` | Create a new account | Public (`/api/v1/auth/**` is `permitAll`) | `RegisterRequest`: `fullName` string, required, 2–100 chars · `email` string, required, must be valid email · `phone` string, required, regex `^\+?[0-9]{7,15}$` · `password` string, required, min 8 chars · `passwordConfirmation` string, required (equality with `password` checked in `UserService.register`, not by annotation) | `AuthResponse`: `user: UserProfileResponse`, `accessToken: string`, `refreshToken: string` | 201 Created · 400 (passwords don't match, or validation) · 409 Conflict (email already exists) |
| `POST /api/v1/auth/login` | Authenticate and issue tokens | Public | `LoginRequest`: `email` string, required, valid email · `password` string, required | `AuthResponse` (same shape as above) | 200 OK · 401 Unauthorized (bad credentials, `BadCredentialsException` caught and rethrown) · 403 Forbidden (account suspended) |
| `POST /api/v1/auth/forgot-password` | Request a password-reset OTP by email | Public | `ForgotPasswordRequest`: `email` string, required, valid email | `MessageResponse`: `detail: string` | 200 OK always (does not reveal whether the email exists — see Section 2) |
| `POST /api/v1/auth/verify-otp` | Verify a 6-digit OTP before allowing reset | Public | `VerifyOtpRequest`: `email` string, required, valid email · `otp` string, required, exactly 6 chars | `MessageResponse` | 200 OK · 400 Bad Request (invalid/expired code) |
| `POST /api/v1/auth/reset-password` | Reset password using OTP | Public | `ResetPasswordRequest`: `email` string, required, valid email · `otp` string, required, exactly 6 chars · `newPassword` string, required, min 8 chars · `passwordConfirmation` string, required | `MessageResponse` | 200 OK · 400 (passwords don't match, invalid/expired code) |
| `POST /api/v1/auth/refresh` | Exchange a refresh token for a new access token | Public | `RefreshTokenRequest`: `refreshToken` string, required | `RefreshTokenResponse`: `accessToken: string` | 200 OK · 401 Unauthorized (revoked, invalid, or expired refresh token, or user no longer exists) |
| `POST /api/v1/auth/logout` | Revoke a refresh token | Public per `SecurityConfig` (`/api/v1/auth/**`); the `@CurrentUser User user` parameter is accepted but never read in the method body, so this endpoint behaves identically whether or not a valid access token is sent | `RefreshTokenRequest` (optional — `@RequestBody(required = false)`) | None (`Void`) | 205 Reset Content — the controller explicitly returns `HttpStatus.RESET_CONTENT`, not 200/204 (`UserController.java:74`) |
| `GET /api/v1/auth/me` | Get the logged-in user's own profile | Public per the `/api/v1/auth/**` filter-chain matcher, **but functionally requires a valid Bearer token**: `@CurrentUser User user` resolves to `null` for an anonymous caller, and `UserService.getMyProfile` immediately calls `user.getId()`, so an anonymous request throws a `NullPointerException` that is caught by the generic handler | None | `UserProfileResponse`: `id: Long`, `fullName: string`, `email: string`, `phone: string`, `bio: string\|null`, `profilePhotoUrl: string\|null`, `campusLocation: {id, name}\|null`, `isProvider: boolean`, `isSeller: boolean`, `isAdmin: boolean`, `isVerified: boolean`, `isActive: boolean`, `isSuspended: boolean`, `avgRating: BigDecimal\|null`, `ratingCount: int`, `joinDate: string\|null` (ISO instant) | 200 OK (valid token) · 500 Internal Server Error (`ERR: NullPointerException...`) if no/invalid token, instead of a clean 401 |
| `GET /api/v1/users/{id}` | View another user's public profile | Public — matched by the dedicated regex matcher `request.getServletPath().matches("/api/v1/users/\\d+")` | None | `PublicProfileResponse`: `id`, `fullName`, `email`, `profilePhotoUrl`, `bio`, `campusLocation: {id,name}\|null`, `isProvider`, `isSeller`, `isAdmin`, `isVerified`, `isActive`, `isSuspended`, `avgRating`, `ratingCount`, `createdAt: string\|null` | 200 OK · 404 Not Found (user doesn't exist, or is inactive/suspended — `UserService.getPublicProfile` treats both as "no longer available") |
| `GET /api/v1/users/{userId}/listings` | List another user's listings | **Requires authentication** — the path `/api/v1/users/{userId}/listings` does **not** match the `\d+`-only regex above (it has a trailing `/listings` segment) and isn't covered by any other `permitAll` rule, so it falls through to `anyRequest().authenticated()`. This is a verified inconsistency: viewing a user's *profile* is public, but viewing that same user's *listings* is not. | None | `List<ListingResponse>` (see `ListingResponse` shape in §1.2) | 200 OK · 403 Forbidden (no/invalid token) |
| `PATCH /api/v1/users/me` | Update own profile | Requires authentication (`anyRequest().authenticated()`) | `UpdateProfileRequest`: `fullName` string, optional, 2–100 chars if present · `bio` string, optional, no constraint · `phone` string, optional, regex `^\+?[0-9]{7,15}$` if present · `campusLocationId` Long, optional · `profilePhotoUrl` string, optional | `UserProfileResponse` | 200 OK · 400 Bad Request (unknown `campusLocationId`) · 404 (user vanished mid-request) |
| `PATCH /api/v1/users/me/roles` | Toggle Provider / Seller mode | Requires authentication | `RoleToggleRequest`: `isProvider` Boolean, optional (nullable — only applied if non-null) · `isSeller` Boolean, optional | `UserProfileResponse` | 200 OK · 404 |
| `POST /api/v1/users/me/deactivate` | Deactivate (soft-disable) own account | Requires authentication | `DeactivateRequest`: `password` string, required (must match current password) · `reason` string, optional | `MessageResponse` (`{"detail":"Account deactivated."}`) | 200 OK · 400 Bad Request (incorrect password) · 404 |
| `POST /api/v1/users/me/photo` | Upload a profile photo | Requires authentication | Multipart form field `file` (any `MultipartFile`) — no size/type validation in code beyond the global `spring.servlet.multipart.max-file-size: 10MB` in `application.yml` | `UserProfileResponse` | 200 OK · 500 Internal Server Error (file I/O failure — `UserController.java` wraps `IOException` in an unchecked `RuntimeException`, caught generically) |

### 1.2 ListingController (`/api/v1/listings`) — 8 endpoints

Source: `backend/src/main/java/com/campusmarketplace/listing/ListingController.java`, `ListingService.java`, `listing/dto/*.java`.

`ListingResponse` (shared by every endpoint below): `id: Long`, `title: string`, `slug: string`, `listingType: string`, `category: {id, name}`, `price: BigDecimal`, `currency: string`, `stockQuantity: Integer\|null`, `campusLocation: {id, name}`, `owner: {id, fullName, avgRating, ratingCount}`, `primaryImageUrl: string\|null`, `avgRating: BigDecimal\|null`, `ratingCount: int`, `status: string`, `description: string`, `images: [{id, imageUrl, sortOrder}]`, `viewCount: int`, `messageCount: int`, `createdAt: string\|null`.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET /api/v1/listings` | Browse/filter listings (no free-text query) | Public (`/api/v1/listings/**` is `permitAll`) | None — query params: `categoryId`, `minPrice`, `maxPrice`, `campusLocationId`, `listingType`, `sortBy` (default `newest`; one of `price_asc`, `price_desc`, `rating_desc`, `newest`), `page` (default 0), `pageSize` (default 20) | `PageResponse<ListingResponse>` | 200 OK |
| `GET /api/v1/listings/search` | Free-text search + filters | Public, but takes an optional `@CurrentUser User currentUser` used only to log the search (see below) | None — query params as above plus required `q` (search string) | `PageResponse<ListingResponse>` | 200 OK · 400 Bad Request (`q` shorter than 2 characters) |
| `GET /api/v1/listings/{id}` | Get one listing's detail | Public | None | `ListingResponse` | 200 OK · 404 Not Found (missing, or inactive/deleted and caller is neither the owner nor an admin) |
| `POST /api/v1/listings` | Create a listing | Public per `SecurityConfig` path matcher, **but functionally requires authentication**: `@CurrentUser User user` is `null` for anonymous callers and `ListingService.createListing` immediately calls `owner.isProvider()`, throwing an NPE (caught generically → 500) instead of a clean 401/403 | `CreateListingRequest`: `title` string, required, 5–100 chars · `description` string, required, 20–1000 chars · `listingType` string, required (`"service"` or `"product"`) · `categoryId` Long, required · `price` BigDecimal, required, min `0.01` · `currency` string, optional (defaults to `"UGX"` server-side if omitted) · `stockQuantity` Integer, optional in the DTO but **required by business logic when `listingType == "product"`** (`ListingService.java:57`) · `campusLocationId` Long, required · `imageUrls` `List<String>`, optional (only the first 5 are persisted) | `ListingResponse` | 201 Created · 400 Bad Request (unknown category/location, missing stock for a product listing) · 403 Forbidden ("Enable Provider mode..." / "Enable Seller mode..." if the matching role flag on the user is `false`) |
| `PATCH /api/v1/listings/{id}` | Partially update a listing | Public per path matcher; functionally requires auth for the same NPE reason as `POST` above | `UpdateListingRequest`: all fields optional — `title`, `description`, `price`, `currency`, `stockQuantity`, `categoryId`, `campusLocationId`, `imageUrls` (replaces all existing images if provided, max 5 kept) | `ListingResponse` | 200 OK · 400 Bad Request (unknown category/location) · 403 Forbidden (not the owner and not an admin) · 404 Not Found |
| `DELETE /api/v1/listings/{id}` | Soft-delete a listing (sets `status = "deleted"`; row is not removed) | Public per path matcher; functionally requires auth (NPE otherwise) | None | None | 204 No Content · 403 Forbidden (not owner/admin) · 404 Not Found |
| `PATCH /api/v1/listings/{id}/status` | Change listing status (e.g. active/paused) | Public per path matcher; functionally requires auth (NPE otherwise) | `StatusUpdateRequest`: `status` string, required (free-form — no enum/whitelist validation in code) | `ListingResponse` | 200 OK · 403 Forbidden (not owner/admin) · 404 Not Found |
| `GET /api/v1/listings/mine` | List the caller's own listings (any status) | Public per path matcher; functionally requires auth (NPE on `owner.getId()` if anonymous) | None | `List<ListingResponse>` | 200 OK · 500 (NPE if anonymous) |

### 1.3 CategoryController (`/api/v1/categories`) — 5 endpoints

Source: `backend/src/main/java/com/campusmarketplace/category/CategoryController.java`.

**Verified finding**: this entire controller is reachable by `permitAll` (`/api/v1/categories/**`), and unlike every other write endpoint in the API, `createCategory`, `updateCategory`, and `retireCategory` have **no `@CurrentUser`, no `@PreAuthorize`, and no role check anywhere in the method bodies**. Any anonymous caller can create, rename, or retire a category. There is no NPE safety net here (unlike listings) because the controller never touches a user object.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET /api/v1/categories` | List active categories with live listing counts | Public | None | `List<CategoryWithCount>`: each item `{ id, name, slug, listingTypeHint, iconName, description, active: boolean, activeListingCount: long }` | 200 OK |
| `GET /api/v1/categories/{slug}` | Get one category by slug | Public | None | `Category` entity, raw (Jackson getter-based serialization): `{ id, name, slug, listingTypeHint, iconName, description, active }` (boolean getter `isActive()` serializes as `"active"`, not `"isActive"`) | 200 OK · 404 Not Found (missing, or `isActive == false`) |
| `POST /api/v1/categories` | Create a category | **Public — no authentication or role check of any kind** | `CreateCategoryRequest`: `name` string, required · `listingTypeHint` string, required (free-form, no enum validation) | `Category` entity, raw (same shape as above). `iconName` is **always hard-coded to `"Package"`** (`CategoryController.java:72`) — there is no way to set an icon via the API. `slug` is auto-derived from `name` (lower-cased, non-alphanumerics stripped) plus a `System.currentTimeMillis()` suffix for uniqueness. | 201 Created · 409 Conflict (a category with that exact `name` already exists) |
| `PATCH /api/v1/categories/{id}` | Update a category | **Public — no authentication or role check** | `UpdateCategoryRequest`: `name` string, required · `listingTypeHint` string, required · `description` string, optional | `Category` entity, raw. Updating regenerates the `slug` (from the new `name` + a fresh timestamp) every time, even if `name` didn't change. `iconName` is never touched by this endpoint (stays whatever it was). | 200 OK · 404 Not Found |
| `DELETE /api/v1/categories/{id}` | Retire (soft-delete) a category — sets `isActive = false`; row is kept | **Public — no authentication or role check** | None | None | 204 No Content · 404 Not Found |

### 1.4 CampusLocationController (`/api/v1/locations`) — 1 endpoint

Source: `backend/src/main/java/com/campusmarketplace/location/CampusLocationController.java`.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET /api/v1/locations` | List active campus locations | Public (`/api/v1/locations/**`) | None | `List<CampusLocation>` entity, raw: `{ id, name, zone, active }` (`isActive()` → `"active"`) | 200 OK |

### 1.5 MessagingController (`/api/v1`) — 8 endpoints

Source: `backend/src/main/java/com/campusmarketplace/messaging/MessagingController.java`, `MessagingService.java`. None of these paths match any `permitAll` rule, so every one genuinely requires authentication (`anyRequest().authenticated()`), and every controller method reads `@CurrentUser User user` and dereferences it immediately with no null-guard risk.

`ConversationResponse` shape: `id: Long`, `listing: {id, title}\|null`, `otherParticipant: {id, fullName, profilePhotoUrl}`, `lastMessageAt: Instant`, `unreadCount: long`, `lastMessagePreview: string`, `createdAt: Instant`.
`MessageResponse` shape: `id: Long`, `senderId: Long`, `content: string` (the record field is named `body` in Java but is annotated `@JsonProperty("content")`, so the wire field is `content`), `isRead: boolean`, `createdAt: Instant`.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `POST /api/v1/conversations` | Start a conversation about a listing (or reuse an existing one) | Required | `StartConversationRequest`: `listingId` Long, required · `initialMessage` string, required, 1–1000 chars | `ConversationResponse` | 201 Created · 400 Bad Request (messaging yourself) · 404 Not Found (listing missing) |
| `GET /api/v1/conversations` | List the caller's conversations | Required | None | `List<ConversationResponse>` | 200 OK |
| `GET /api/v1/conversations/{id}/messages` | List messages in a conversation (also marks them read as a side effect) | Required | None | `List<MessageResponse>` | 200 OK · 403 Forbidden (not a participant) · 404 Not Found |
| `POST /api/v1/conversations/{id}/messages` | Send a message | Required | `SendMessageRequest`: `body` string, required, 1–1000 chars | `MessageResponse` | 201 Created · 403 Forbidden (not a participant) · 404 Not Found |
| `POST /api/v1/conversations/{id}/mark-read` | Mark a conversation's messages read | Required | None | None | 200 OK · 403 Forbidden · 404 Not Found |
| `POST /api/v1/conversations/{id}/archive` | Archive a conversation (per-participant flag) | Required | None | None | 200 OK · 403 Forbidden · 404 Not Found |
| `POST /api/v1/conversations/{id}/restore` | Un-archive a conversation | Required | None | None | 200 OK · 403 Forbidden · 404 Not Found |
| `DELETE /api/v1/conversations/{id}` | Permanently delete a conversation and its messages | Required | None | None | 204 No Content · 403 Forbidden · 404 Not Found |

### 1.6 AdminController (`/api/v1/admin`) — 9 endpoints

Source: `backend/src/main/java/com/campusmarketplace/moderation/AdminController.java`, `ModerationService.java`. Class-level `@PreAuthorize("hasRole('ADMIN')")` plus the filter-chain `anyRequest().authenticated()` (no `permitAll` rule covers `/api/v1/admin/**`) — every endpoint here needs a valid token **and** `isAdmin == true` on the user (checked via the `ROLE_ADMIN` authority granted in `User.getAuthorities()`).

**Verified security finding**: `GET /api/v1/admin/reports` returns `Page<Report>` — the raw JPA entity, not a DTO. `Report.reporter` and `Report.resolvedBy` are lazy `User` associations, and `User` (`user/User.java`) has **no `@JsonIgnore` anywhere**, including on its password field (`@Column(name = "password_hash") private String password;` with a public `getPassword()`). Because Spring Boot's default `spring.jpa.open-in-view=true` is not overridden in `application.yml`, the Hibernate session stays open through serialization, so these lazy associations actually resolve (no `LazyInitializationException`) — and Jackson serializes the full `User` object, **including the bcrypt password hash** (`"password": "$2a$..."`), plus every `UserDetails` interface getter (`username`, `authorities`, `accountNonExpired`, `accountNonLocked`, `credentialsNonExpired`, `enabled`). This is the only place in the API where a raw `User` entity is serialized; every other endpoint uses a DTO (`UserProfileResponse`/`PublicProfileResponse`) that deliberately omits the password.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET /api/v1/admin/users` | List all users (paginated) | Admin only | None — query params `page` (default 0), `pageSize` (default 20) | Spring `Page<PublicProfileResponse>` (native Page envelope, see §1 preamble) | 200 OK |
| `POST /api/v1/admin/users/{id}/suspend` | Suspend a user | Admin only | Raw `Map<String,String>`, no DTO/validation — key `reason` optional (defaults to `"No reason provided"`) | `Map<String,String>` → `{"detail":"User suspended"}` | 200 OK · 404 Not Found |
| `POST /api/v1/admin/users/{id}/reactivate` | Reactivate a suspended user | Admin only | None | `{"detail":"User reactivated"}` | 200 OK · 404 Not Found |
| `POST /api/v1/admin/users/{id}/verify` | Mark a user as verified | Admin only (the `@CurrentUser User admin` parameter is accepted but unused in the method body) | None | `{"detail":"User verified"}` | 200 OK · 404 Not Found |
| `POST /api/v1/admin/listings/{id}/status` | Force-deactivate a listing (sets `status="deleted"`) | Admin only | Raw `Map<String,String>` — key `reason` optional (default `"No reason provided"`) | `{"detail":"Listing deactivated"}` | 200 OK · 404 Not Found |
| `DELETE /api/v1/admin/reviews/{id}` | Soft-delete a review (sets `deleted=true`) | Admin only | Raw `Map<String,String>` — key `reason` optional | None | 204 No Content · 404 Not Found |
| `GET /api/v1/admin/reports` | List moderation reports, filterable | Admin only | None — query params `status`, `targetType` (both optional filters), `page` (default 0), `pageSize` (default 20) | Spring `Page<Report>` — **raw entity, see security finding above** | 200 OK |
| `POST /api/v1/admin/reports/{id}/resolve` | Resolve or dismiss a report, optionally linking a moderation action | Admin only | Raw `Map<String,Object>` — `resolution` string, optional (default `"dismissed"`; any value other than the literal string `"resolved"` is stored as `"dismissed"`) · `resolution_notes` string, optional (default `""`) · `linked_action` object, optional: `{ type: string, target_id: number }` | `{"detail":"Report resolved"}` | 200 OK · 404 Not Found |
| `GET /api/v1/admin/analytics/overview` | Platform-wide stats for the admin dashboard | Admin only | None — query params `dateFrom`, `dateTo` accepted but **never read in the method body** (`AdminController.java:134-156` — they exist as parameters purely for the method signature; the query is not date-filtered at all) | `Map<String,Object>`: `total_users: long`, `total_active_listings: long`, `total_messages_sent: long`, `total_reviews_submitted: long`, `listings_by_category: [{category_id, category_name, listing_count}]`, `platform_avg_rating: Double\|null` | 200 OK |

### 1.7 ReportController (`/api/v1/reports`) — 1 endpoint

Source: `backend/src/main/java/com/campusmarketplace/moderation/ReportController.java`, `ModerationService.java`.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `POST /api/v1/reports` | Submit a report against a user, listing, or review | Required — `/api/v1/reports` is not covered by any `permitAll` matcher, so `anyRequest().authenticated()` applies. (The controller/service defensively null-checks `user`, e.g. `user != null ? user.getId() : null`, which is dead code given the enforced auth — a sign the original author expected this to be public.) | Raw `Map<String,Object>`, no DTO/validation — `target_type` string, required by application logic (used via `body.get(...)`, not `@Valid`) · `target_id` number, required · `reason` string · `description` string. `ModerationService.submitReport` counts existing open reports (`countOpenReports`) but — despite a check for `openReports >= 3` — only logs a warning; it never actually blocks or rate-limits the submission (matches the "Relax report submission limit" change visible in recent git history). | `ReportResponse`: `id`, `reporterId`, `targetType`, `targetId`, `reason`, `description`, `status`, `createdAt` | 201 Created |

### 1.8 NotificationController (`/api/v1/notifications`) — 7 endpoints

Source: `backend/src/main/java/com/campusmarketplace/notification/NotificationController.java`. None of these paths match a `permitAll` rule, so all require authentication, and every method reads `@CurrentUser User user` safely (never null in practice).

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET /api/v1/notifications` | List notifications for the caller | Required | None — query params `archived` (default `false`), `page` (default 0), `pageSize` (default 50) | `PageResponse<NotificationResponse>` (custom envelope — `next`/`previous` always `null`, see §1 preamble). Each item: `{ id, notifType, title, body, relatedType, relatedId, isRead, isArchived, createdAt }` | 200 OK |
| `GET /api/v1/notifications/unread-count` | Get the caller's unread notification count | Required | None | Bare JSON number (`Long`), not wrapped in an object | 200 OK |
| `POST /api/v1/notifications/{id}/mark-read` | Mark one notification read | Required | None | None | 200 OK · 403 Forbidden (notification belongs to another user — explicit `ResponseEntity.status(403)`, not `ApiException`) · (uncaught `RuntimeException("Notification not found")` if missing, which the generic handler turns into **500**, not 404 — inconsistent with the rest of the API, which uses `ApiException.notFound` for a proper 404) |
| `POST /api/v1/notifications/mark-all-read` | Mark all of the caller's notifications read (`@Transactional`, bulk update query) | Required | None | None | 200 OK |
| `POST /api/v1/notifications/{id}/archive` | Archive a notification | Required | None | None | 200 OK · 403 Forbidden (not owner) · 500 (missing — same `RuntimeException` issue as above) |
| `POST /api/v1/notifications/{id}/restore` | Un-archive a notification | Required | None | None | 200 OK · 403 Forbidden (not owner) · 500 (missing) |
| `DELETE /api/v1/notifications/{id}` | Permanently delete a notification | Required | None | None | 204 No Content · 403 Forbidden (not owner) · 500 (missing) |

### 1.9 RecommendationController (`/api/v1/recommendations`) — 1 endpoint

Source: `backend/src/main/java/com/campusmarketplace/recommendation/RecommendationController.java`. Full algorithm detail in Section 3.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `GET /api/v1/recommendations` | Get a personalized, scored list of active listings, excluding the caller's own | Required — not covered by any `permitAll` rule | None — query params `page` (default 0), `pageSize` (default 20) | `List<ListingResponse>` (plain list — **not** wrapped in `PageResponse`, unlike `/listings`; there is no total-count field, so a client can't tell how many pages exist) | 200 OK |

### 1.10 ReviewController (`/api/v1`) — 5 endpoints

Source: `backend/src/main/java/com/campusmarketplace/review/ReviewController.java`, `ReviewService.java`.

`ReviewResponse` shape: `id: Long`, `listingId: Long`, `reviewer: {id, fullName, profilePhotoUrl}`, `rating: int`, `comment: string\|null`, `createdAt: Instant`.

| Method & Path | Purpose | Auth | Request Body | Response Body | Status Codes |
|---|---|---|---|---|---|
| `POST /api/v1/reviews` | Submit a review for a listing | Required (`/api/v1/reviews` is not covered by any `permitAll` matcher) | `CreateReviewRequest`: `listingId` Long, required · `rating` Integer, required, 1–5 · `comment` string, optional, max 500 chars | `ReviewResponse` | 201 Created · 400 Bad Request (reviewing your own listing) · 403 Forbidden (no prior conversation with the listing owner — reviews are gated behind having messaged them first) · 409 Conflict (already reviewed this listing) · 404 Not Found (listing missing) |
| `PATCH /api/v1/reviews/{id}` | Edit own review | Required | `UpdateReviewRequest`: `rating` Integer, optional, 1–5 · `comment` string, optional, max 500 chars | `ReviewResponse` | 200 OK · 403 Forbidden (not the reviewer) · 404 Not Found |
| `DELETE /api/v1/reviews/{id}` | Soft-delete own review (`deleted=true`) | Required | None | None | 204 No Content · 403 Forbidden (not the reviewer and not an admin) · 404 Not Found |
| `GET /api/v1/listings/{listingId}/reviews` | List reviews for a listing | Public (`/api/v1/listings/*/reviews` explicit matcher, also covered by the broader `/api/v1/listings/**` matcher) | None — query params `page` (default 0), `pageSize` (default 20) | Spring native `Page<ReviewResponse>` | 200 OK |
| `GET /api/v1/users/{userId}/reviews` | List reviews received by a user (as a listing owner) | Public (`/api/v1/users/*/reviews` explicit matcher) | None — query params `page` (default 0), `pageSize` (default 20) | Spring native `Page<ReviewResponse>` | 200 OK |

**Endpoint count check**: 14 (User) + 8 (Listing) + 5 (Category) + 1 (Location) + 8 (Messaging) + 9 (Admin) + 1 (Report) + 7 (Notification) + 1 (Recommendation) + 5 (Review) = **59**.

---

## 2. Authentication sequence

Source: `security/JwtTokenProvider.java`, `security/JwtAuthenticationFilter.java`, `security/SecurityConfig.java`, `security/UserDetailsServiceImpl.java`, `user/UserService.java`, `application.yml`.

1. **Registration** — `POST /api/v1/auth/register` → `UserService.register`: validates `password == passwordConfirmation`, checks `userRepository.existsByEmail`, hashes the password with `BCryptPasswordEncoder` (`passwordEncoder.encode(...)`), persists the `User` row, fires `EmailService.sendWelcomeEmail` asynchronously (`@Async`, does not block the response), then immediately mints an access token + refresh token for the new user and returns them in `AuthResponse` — registration logs the user in automatically, no separate login step required.
2. **Login** — `POST /api/v1/auth/login` → `UserService.login`: builds a `UsernamePasswordAuthenticationToken(email, password)` and hands it to Spring Security's `AuthenticationManager.authenticate(...)`. Internally this calls `UserDetailsServiceImpl.loadUserByUsername(email)` (looks up by email) and then Spring Security's `DaoAuthenticationProvider` compares the submitted password against the stored BCrypt hash. A `BadCredentialsException` is caught and rethrown as `ApiException.unauthorized("Invalid email or password")` (401). If authentication succeeds, the user is re-fetched via `userRepository.findByEmailWithLocation` (eager-loads `campusLocation`); if `user.isSuspended()` is true, the request is rejected with `ApiException.forbidden(...)` (403) **after** the password has already been verified correct.
3. **Token issuance** — on successful login (or registration), `JwtTokenProvider.generateAccessToken(userId, email)` and `generateRefreshToken(userId)` are called. Both are signed with the same HMAC-SHA key, derived from the plaintext secret `app.jwt.secret` (`application.yml`) via `Keys.hmacShaKeyFor(secret.getBytes(UTF_8))`.
   - **Access token claims**: `sub` = user ID (as a string), `email` = the user's email (custom claim), `iat` = issued-at, `exp` = now + `app.jwt.access-token-expiration` (**900000 ms = 15 minutes**, from `application.yml`).
   - **Refresh token claims**: `sub` = user ID only (no `email` claim), `iat`, `exp` = now + `app.jwt.refresh-token-expiration` (**604800000 ms = 7 days**).
   - Both tokens are returned to the client in the `AuthResponse`/`RefreshTokenResponse` JSON body — there is no `Set-Cookie`; the frontend stores them itself (in `localStorage`, keys `cm_token` and `cm_refresh_token` — see `artifacts/mockup-sandbox/src/lib/api.ts`).
4. **Authenticated request** — the client sends `Authorization: Bearer <accessToken>`. `JwtAuthenticationFilter` (registered `addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)`, so it runs on every request before Spring Security's own auth machinery) does, in order:
   a. `extractToken(request)` — reads the `Authorization` header, strips the `"Bearer "` prefix if present, else returns `null`.
   b. If a token string is present, calls `jwtTokenProvider.validateToken(token)`, which attempts `Jwts.parser().verifyWith(secretKey).build().parseSignedClaims(token)` inside a try/catch; any `JwtException` or `IllegalArgumentException` (bad signature, malformed token, **or expired token** — `ExpiredJwtException` is a subtype of `JwtException`) causes `validateToken` to return `false` silently.
   c. If valid, `jwtTokenProvider.getUserIdFromToken(token)` re-parses the claims and returns the `sub` claim as a `Long`.
   d. `userDetailsService.loadUserById(userId)` fetches the full `User` entity fresh from the database (so role/suspension changes take effect on the very next request, not just at login).
   e. A `UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())` is built and set into `SecurityContextHolder.getContext().setAuthentication(...)`. `User.getAuthorities()` returns `ROLE_ADMIN` if `isAdmin`, else `ROLE_USER` — this single-role model is what `@PreAuthorize("hasRole('ADMIN')")` on `AdminController` checks.
   f. If no token, or an invalid/expired one, the filter does **nothing** (no exception thrown) and simply calls `filterChain.doFilter(...)` — the request proceeds as anonymous. Whether that anonymous request is then rejected depends entirely on `SecurityConfig`'s `authorizeHttpRequests` rules (see Section 1 for the per-path breakdown); there is no custom `AuthenticationEntryPoint` configured, so Spring Security's default behavior for a rejected anonymous request on a stateless (no `formLogin`/`httpBasic`) chain returns **403 Forbidden**, not 401.
5. **Access-token expiry (15 min) and refresh** — the access token is short-lived by design. The frontend (`artifacts/mockup-sandbox/src/lib/api.ts`, function `request`) intercepts any `401` response, calls `refreshToken()` (which `POST`s the stored refresh token to `/api/v1/auth/refresh`), stores the new access token, and retries the original request exactly once. On the backend, `POST /api/v1/auth/refresh` → `UserService.refresh`: first checks an in-memory `blacklistedTokens` set (see step 6), then `jwtTokenProvider.validateToken`, then re-derives the user and issues a **brand-new access token only** — the refresh token itself is never rotated/replaced, so the same refresh token remains valid and reusable for its full 7-day life (or until logout/blacklisting).
   - Note: the frontend's 401-triggered refresh logic will rarely fire for the "public per SecurityConfig, protected in practice via NPE" endpoints documented in Section 1, because those return **500**, not 401, when unauthenticated — the refresh-and-retry path only helps on genuinely-enforced (`anyRequest().authenticated()`) endpoints.
6. **Logout / revocation** — `POST /api/v1/auth/logout` → `UserService.logout(refreshToken)` adds the given refresh token string to an **in-memory, non-persistent** `HashSet<String> blacklistedTokens` field on the singleton `UserService` bean. This means: (a) revocation is checked only inside `refresh()`, so a blacklisted refresh token can no longer be exchanged for a new access token, but any **access token already issued** remains valid until its own 15-minute expiry regardless of logout; (b) the blacklist is wiped on every application restart/redeploy (no database table, no Redis) — in a multi-instance deployment it would not even be shared between instances.
7. **Password reset (parallel flow, not part of the JWT lifecycle)** — `forgot-password` always returns the same generic 200 message whether or not the email exists (`"If an account with that email exists..."`), to avoid leaking which emails are registered. If the email does exist, a 6-digit numeric OTP (`SecureRandom`, zero-padded) is generated, any prior unused token for that user is deleted (`passwordResetTokenRepository.deleteByUserId`), a new `PasswordResetToken` is stored with a 900-second (15-minute) expiry, and `EmailService.sendOtpEmail` is fired asynchronously. `verify-otp` and `reset-password` both look up the token by `(userId, otp, used=false)` and check `token.isValid()` (not expired) before proceeding; `reset-password` additionally re-hashes and saves the new password and flags the token `used=true` so it cannot be replayed.

---

## 3. Recommendation scoring algorithm — full detail

Source: `backend/src/main/java/com/campusmarketplace/recommendation/RecommendationService.java` (read in full).

### 3.1 The formula

For each active listing not owned by the requesting user, a single composite score is computed:

```
score = 0.4 × ratingScore + 0.3 × locationScore + 0.3 × preferenceScore
```

The three weights are declared as `private static final double` constants at the top of the class:

```java
RATING_WEIGHT = 0.4
LOCATION_WEIGHT = 0.3
PREFERENCE_WEIGHT = 0.3
```

(They sum to 1.0, so `score` is naturally bounded to `[0, 1]` given that each component score below is also bounded to `[0, 1]`.)

### 3.2 Component scores

- **`ratingScore(BigDecimal avgRating)`** — the *listing owner's* average rating (not the listing's own rating), normalized to a 0–1 scale: `avgRating.doubleValue() / 5.0`. **Cold-start default: if the owner has no rating yet (`avgRating == null`), the score is `0.5`** — a neutral midpoint rather than penalizing new/unrated providers.
- **`locationScore(String userZone, String listingZone)`** — compares the *zone* (not the specific campus location) of the requesting user's `campusLocation` against the listing's `campusLocation.zone`:
  - If the user has no campus location set (`userZone == null`) → **cold-start default `0.5`**.
  - Exact zone match → `1.0`.
  - Adjacent zone (per a hard-coded adjacency map, see below) → `0.5`.
  - Otherwise (non-adjacent, different zone) → `0.0`.
  - The adjacency map is a fixed `Map<String, Set<String>>` constant:
    ```java
    "central" → {"north", "south"}
    "north"   → {"central"}
    "south"   → {"central"}
    ```
    This means `"central"` is adjacent to both other zones, but `"north"` and `"south"` are **not** adjacent to each other — only to `"central"`. Any zone string not present as a key (e.g. a typo, or a zone added to the DB but not to this map) falls back to an empty adjacency set, so it only ever scores `1.0` (exact self-match) or `0.0`.
- **`preferenceScore(long categoryInteractions, long totalInteractions, long totalCategories)`** — measures how much the user has historically engaged with *this listing's category*, relative to their engagement across all categories:
  - **Cold-start default: if the user has zero recorded interactions at all (`totalInteractions == 0`), every category gets an equal `1.0 / totalCategories`** (a uniform prior over all active categories — e.g. with 6 active categories, every listing in every category scores `1/6 ≈ 0.167` on this component for a brand-new user).
  - Otherwise: `categoryInteractions / (double) totalInteractions` — a straight proportion.
  - "Interactions" are the **sum of two signals**, both counted per-category for the requesting user and merged via `Map.merge(catId, count, Long::sum)`:
    1. `searchLogRepository.countByUserGroupedByCategory(userId)` — how many prior searches (rows in the `SearchLog` table, written by `ListingService.searchListings` whenever a logged-in user does a text search with a category filter) the user has made per category.
    2. `listingViewRepository.countByUserGroupedByCategory(userId)` — how many listing detail-page views (rows in `ListingView`, written by `ListingService.getListingDetail` whenever a non-owner logged-in user views a listing) the user has made, per the *viewed listing's* category.
    - Views and searches are weighted **equally** (both just add `+1` per row to the same running count) — there is no separate weighting between "viewed a listing in category X" and "searched within category X".

### 3.3 Candidate set, sort, and pagination

- Candidates come from `listingRepository.findActiveListingsExcluding(user.getId())` — i.e. only listings with `status = "active"`, excluding any listing the requester themselves owns. There is no other filtering (no category filter, no price filter) on this endpoint.
- After scoring, candidates are sorted **descending by score**: `.sorted((a, b) -> Double.compare(b.score(), a.score()))`. This is a plain `Comparator` with **no explicit tie-break** — Java's `Stream.sorted` on a comparator that returns 0 for ties preserves encounter order for equal scores (stable sort), so ties fall back to whatever order `findActiveListingsExcluding` returned them in (effectively DB-insertion/query order, not an intentional secondary ranking signal).
- **Pagination is done in application memory, not in the database**: the *entire* candidate set is loaded, scored, and sorted, and only then is `.skip((long) page * pageSize).limit(pageSize)` applied. This means recommendation pagination does not scale with the size of the active-listings table (no `LIMIT`/`OFFSET` at the SQL level), unlike every other paginated endpoint in the API (which use Spring Data `Pageable`).
- The response is a plain `List<ListingResponse>` (see §1.9) — there is no total-count metadata, so a client cannot determine how many total recommendations exist or whether another page is available; it must keep requesting subsequent pages until an empty (or shorter-than-`pageSize`) list comes back.

---

## 4. Deployment architecture

### 4.1 What runs where

- **Backend**: a Spring Boot 3.4.4 / Java 21 application, built and containerized via `backend/Dockerfile`, deployed on **Railway**. This is confirmed directly (not inferred) by the frontend's own environment file, `artifacts/mockup-sandbox/.env`:
  ```
  VITE_API_ORIGIN=https://java-backend-production-5a69.up.railway.app
  ```
  `java-backend-production-5a69.up.railway.app` is a Railway-generated production service domain (Railway's standard `<service>-production-<hash>.up.railway.app` pattern).
- **Frontend**: the Vite/React app in `artifacts/mockup-sandbox`. The user's brief states this is hosted on Vercel; I looked for direct in-repo confirmation and found **none** — there is no `vercel.json`, no `.vercel/` directory, and no Vercel references anywhere in the actual application code or configs (the only repo hits for "vercel" are in `Campus_Marketplace_SRS_Technical_Blueprint.md`, which documents an *earlier, superseded* Django+Render+Vercel architecture plan, and an unrelated line in `pnpm-lock.yaml`). This absence is not itself disconfirming — Vercel's zero-config import for a standard Vite project needs no committed config file, auto-detecting `vite build` → `dist` — but I can only verify the **backend's** production host from repository evidence; the frontend's Vercel hosting is stated by the user and is architecturally consistent with the codebase (a static Vite build with a `VITE_API_ORIGIN` env var pointing off to a separately-hosted API), but is not something this repository itself proves.
- **Database**: PostgreSQL in production (see the `prod` Spring profile below); an in-memory H2 database is used only for local `dev`-profile runs.

### 4.2 How they connect

- Exact env var: **`VITE_API_ORIGIN`**, read once in `artifacts/mockup-sandbox/src/lib/api.ts:1`: `const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8080";`. Every API call is built from `API_BASE = ${API_ORIGIN}/api/v1`, and `absoluteUrl()` uses the same `API_ORIGIN` to resolve relative asset paths (e.g. `/uploads/photos/...`) returned by the backend into fully-qualified URLs. In the deployed `.env`, this is set to the Railway backend URL shown above (no secret value here — it's a public API base URL, not a credential).
- Backend-side, the production Spring profile (`application.yml`, `on-profile: prod` block) reads the database connection from **`${JDBC_DATABASE_URL}`** — a Railway-convention environment variable name for the Postgres connection string that Railway's managed Postgres plugin injects automatically when linked to a service. CORS is wide open (`allowedOriginPatterns: ["*"]`, `allowCredentials: true` — see `SecurityConfig.corsConfigurationSource()`), so there's no origin allow-list to keep in sync between the two deployments.
- Mail credentials (`spring.mail.username`/`password` in `application.yml`) and the JWT signing secret (`app.jwt.secret`) are committed in plaintext in `application.yml` in this repository rather than injected via environment variables in the `prod` profile block — the `prod` profile only overrides the datasource URL, multipart limits, and disables the H2 console; it does not override `app.jwt.secret` or `spring.mail.*`, so the same values checked into source control are used in production too. (Values themselves are not reproduced here per the request not to expose secrets — see `backend/src/main/resources/application.yml` directly.)

### 4.3 Dockerfile, line by line

Source: `backend/Dockerfile` (12 lines, multi-stage build):

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build   # Stage 1: build image — Maven 3.9 on Eclipse Temurin JDK 21
WORKDIR /app
COPY pom.xml ./                              # Copy only the POM first (Docker layer-cache optimization)
RUN mvn dependency:go-offline -B              # Pre-download all dependencies into the layer cache, batch mode
COPY src src                                  # Now copy source (invalidates cache only when source changes)
RUN mvn package -DskipTests -B                # Compile + package the fat JAR, skipping the test suite

FROM eclipse-temurin:21-jre                   # Stage 2: runtime image — JRE-only (no JDK, no Maven) on Java 21
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar   # Copy just the built JAR out of the build stage
EXPOSE 8080                                   # Documents the port the app listens on (server.port: 8080)
CMD ["java", "-jar", "app.jar"]                # Startup command — plain `java -jar`, no JVM flags, no profile flag
```

### 4.4 Startup command in production

The literal container `CMD` is `java -jar app.jar` — it does **not** pass `--spring.profiles.active=prod` or any `-D` system property. For the `prod` profile block in `application.yml` to actually activate (as opposed to the default/base profile, which points at `localhost:5432`), the environment variable **`SPRING_PROFILES_ACTIVE=prod`** must be set on the Railway service itself. This is Railway's standard mechanism for Spring profile selection (env vars map to Spring relaxed-binding properties automatically), but it is configured in the Railway dashboard/service settings, not in any file present in this repository — I looked for a `railway.json`, `railway.toml`, `Procfile`, or `nixpacks.toml` that might pin this and found none, so this detail is inferred from Railway convention plus the presence of a `prod`-profile block that would otherwise never be selected, not read directly from a committed config file.

---

## 5. Package / module structure

### 5.1 Backend — `backend/src/main/java/com/campusmarketplace/`

Feature-based packages (not layer-based) — each business domain owns its own `Controller`, `Service`, `Repository`, entity class(es), and a `dto/` sub-package, all in one folder:

```
com/campusmarketplace/
├── CampusMarketplaceApplication.java        (Spring Boot entry point)
├── category/
│   ├── Category.java                        (entity)
│   ├── CategoryController.java
│   ├── CategoryRepository.java
│   └── dto/
│       ├── CategoryWithCount.java
│       ├── CreateCategoryRequest.java
│       └── UpdateCategoryRequest.java
├── common/                                   (cross-cutting, no controller)
│   ├── ApiException.java
│   ├── BaseEntity.java
│   ├── ErrorResponse.java
│   ├── GlobalExceptionHandler.java
│   └── PageResponse.java
├── config/
│   ├── DataSeeder.java
│   └── WebConfig.java
├── email/
│   └── EmailService.java
├── listing/
│   ├── CategoryListingCount.java             (projection interface)
│   ├── Listing.java                          (entity)
│   ├── ListingController.java
│   ├── ListingImage.java                     (entity)
│   ├── ListingImageRepository.java
│   ├── ListingRepository.java
│   ├── ListingService.java
│   ├── ListingView.java                      (entity — view-tracking log)
│   ├── ListingViewRepository.java
│   ├── SearchLog.java                        (entity — search-tracking log)
│   ├── SearchLogRepository.java
│   └── dto/
│       ├── CreateListingRequest.java
│       ├── ListingResponse.java
│       ├── StatusUpdateRequest.java
│       └── UpdateListingRequest.java
├── location/
│   ├── CampusLocation.java                   (entity)
│   ├── CampusLocationController.java
│   └── CampusLocationRepository.java
├── messaging/
│   ├── Conversation.java                     (entity)
│   ├── ConversationRepository.java
│   ├── Message.java                          (entity)
│   ├── MessageRepository.java
│   ├── MessagingController.java
│   ├── MessagingService.java
│   └── dto/
│       ├── ConversationResponse.java
│       ├── MessageResponse.java
│       ├── SendMessageRequest.java
│       └── StartConversationRequest.java
├── moderation/
│   ├── AdminActionLog.java                   (entity)
│   ├── AdminActionLogRepository.java
│   ├── AdminController.java
│   ├── ModerationService.java
│   ├── Report.java                           (entity)
│   ├── ReportController.java
│   ├── ReportRepository.java
│   └── dto/
│       └── ReportResponse.java
├── notification/
│   ├── Notification.java                     (entity)
│   ├── NotificationController.java
│   ├── NotificationRepository.java
│   ├── NotificationService.java
│   └── dto/
│       └── NotificationResponse.java
├── recommendation/
│   ├── RecommendationController.java
│   └── RecommendationService.java            (no repository/entity of its own — reads other domains' repos)
├── review/
│   ├── Review.java                           (entity)
│   ├── ReviewController.java
│   ├── ReviewRepository.java
│   ├── ReviewService.java
│   └── dto/
│       ├── CreateReviewRequest.java
│       ├── ReviewResponse.java
│       └── UpdateReviewRequest.java
├── security/
│   ├── CurrentUser.java                      (custom @AuthenticationPrincipal annotation)
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   ├── SecurityConfig.java
│   └── UserDetailsServiceImpl.java
└── user/
    ├── PasswordResetToken.java                (entity)
    ├── PasswordResetTokenRepository.java
    ├── User.java                              (entity, implements UserDetails)
    ├── UserController.java
    ├── UserRepository.java
    ├── UserService.java
    └── dto/
        ├── AuthResponse.java
        ├── DeactivateRequest.java
        ├── ForgotPasswordRequest.java
        ├── LoginRequest.java
        ├── MessageResponse.java
        ├── PublicProfileResponse.java
        ├── RefreshTokenRequest.java
        ├── RefreshTokenResponse.java
        ├── RegisterRequest.java
        ├── ResetPasswordRequest.java
        ├── RoleToggleRequest.java
        ├── UpdateProfileRequest.java
        ├── UserProfileResponse.java
        └── VerifyOtpRequest.java
```

### 5.2 Frontend — `artifacts/mockup-sandbox/src/`

(This is the actual frontend application in this repository — there is no top-level `frontend/` directory; the Vite/React app lives under `artifacts/mockup-sandbox/`.)

```
src/
├── App.tsx
├── main.tsx
├── router.tsx
├── pwa.ts
├── env.d.ts
├── index.css
├── .generated/
│   └── mockup-components.ts
├── components/
│   ├── backgrounds/
│   │   ├── gravity-stars-background.tsx
│   │   └── stars-background.tsx
│   ├── layouts/
│   │   ├── admin-layout.tsx
│   │   ├── app-layout.tsx
│   │   └── auth-layout.tsx
│   ├── shared/                                (~15 app-specific shared components: navbar,
│   │                                            admin-sidebar, listing-card, star-rating,
│   │                                            report-dialog, protected-route, etc.)
│   └── ui/                                    (~50 generic UI primitives — Radix-based
│                                                design-system components: button, dialog,
│                                                dropdown-menu, form, table, chart, etc.)
├── contexts/
│   ├── auth-context.tsx
│   └── unread-context.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── api.ts                                  (fetch wrapper, token refresh, response mappers)
│   ├── mock-data.ts
│   └── utils.ts
└── pages/
    ├── landing.tsx
    ├── dashboard.tsx
    ├── admin/
    │   ├── analytics.tsx
    │   ├── categories.tsx
    │   ├── dashboard.tsx
    │   ├── reports.tsx
    │   └── users.tsx
    ├── auth/
    │   ├── forgot-password.tsx
    │   ├── login.tsx
    │   ├── onboarding.tsx
    │   ├── register.tsx
    │   └── reset-password.tsx
    ├── categories/
    │   ├── category-page.tsx
    │   └── index.tsx
    ├── listings/
    │   ├── create.tsx
    │   ├── detail.tsx
    │   ├── edit.tsx
    │   └── my-listings.tsx
    ├── messages/
    │   ├── conversation.tsx
    │   └── index.tsx
    ├── notifications/
    │   └── index.tsx
    ├── profile/
    │   ├── my-profile.tsx
    │   └── public-profile.tsx
    └── search/
        └── index.tsx
```

This is a **route/feature-based `pages/` tree** (one folder per app section, mirroring the router) combined with a conventional **UI-library split** (`components/ui/` = generic design-system primitives, `components/shared/` = app-specific composed components) — not a strict "by-layer" (`containers/`, `views/`, `services/`) structure.

---

## 6. Resolve every remaining "not documented" item

- **Spring Boot version**: **3.4.4**, from `backend/pom.xml`: `<parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.4.4</version></parent>`. Java target: **21** (`<java.version>21</java.version>`).

- **PostgreSQL and H2 versions/drivers**: `pom.xml` does **not** pin explicit versions for either — both dependencies (`org.postgresql:postgresql` and `com.h2database:h2`) omit a `<version>` and are resolved transitively through the `spring-boot-starter-parent:3.4.4` dependency-management BOM. I confirmed the actual resolved versions by running Maven against the live POM (`mvn dependency:tree`, output captured in this session): **PostgreSQL JDBC driver `42.7.5`**, **H2 `2.3.232`**. These are the versions Spring Boot 3.4.4's BOM pins, not values chosen explicitly in this project's `pom.xml`.

- **Vite / Radix UI / react-hook-form / zod / recharts / framer-motion versions**: from `artifacts/mockup-sandbox/package.json` and the workspace-level `pnpm-workspace.yaml` `catalog:` block (several of these are pinned once in the catalog and referenced as `"catalog:"` from the package, rather than version-pinned per-package):
  - **Vite**: `^7.3.2` (catalog)
  - **react-hook-form**: `^7.80.0`
  - **zod**: `^3.25.76` (catalog)
  - **recharts**: `^2.15.4`
  - **framer-motion**: `^12.23.24` (catalog)
  - **Radix UI**: there is no single `@radix-ui/react` package — the project depends on 27 separate `@radix-ui/react-*` packages, each independently versioned in `package.json`. The full, exact list: `react-accordion ^1.2.14`, `react-alert-dialog ^1.1.17`, `react-aspect-ratio ^1.1.10`, `react-avatar ^1.2.0`, `react-checkbox ^1.3.5`, `react-collapsible ^1.1.14`, `react-context-menu ^2.3.1`, `react-dialog ^1.1.17`, `react-dropdown-menu ^2.1.18`, `react-hover-card ^1.1.17`, `react-label ^2.1.10`, `react-menubar ^1.1.18`, `react-navigation-menu ^1.2.16`, `react-popover ^1.1.17`, `react-progress ^1.1.10`, `react-radio-group ^1.4.1`, `react-scroll-area ^1.2.12`, `react-select ^2.3.1`, `react-separator ^1.1.10`, `react-slider ^1.4.1`, `react-slot ^1.3.0`, `react-switch ^1.3.1`, `react-tabs ^1.1.15`, `react-toast ^1.2.17`, `react-toggle ^1.1.12`, `react-toggle-group ^1.1.13`, `react-tooltip ^1.2.10`.

- **Password encoder**: **`BCryptPasswordEncoder`** (Spring Security's default cost factor, no custom strength argument passed) — confirmed as the actual configured `PasswordEncoder` bean in `security/SecurityConfig.java`:
  ```java
  @Bean
  public PasswordEncoder passwordEncoder() {
      return new BCryptPasswordEncoder();
  }
  ```

- **"Provider" vs "Seller"**: both are **discrete boolean fields directly on the `User` entity** (`user/User.java`), not on `Listing`, and not a single combined "role" enum: `private boolean isProvider;` and `private boolean isSeller;` (columns `is_provider` and `is_seller`, both `nullable = false`). They're independently toggle-able via `PATCH /api/v1/users/me/roles` (`RoleToggleRequest`), and independently enforced at listing-creation time in `ListingService.createListing`: creating a `listingType == "service"` listing requires `owner.isProvider() == true`, while `listingType == "product"` requires `owner.isSeller() == true`. A user can be both, neither, or either — they are not mutually exclusive.

- **Validation annotations on registration/listing DTOs** (already itemized field-by-field in Section 1, restated here for a direct answer):
  - `RegisterRequest`: `@NotBlank @Size(min=2,max=100)` on `fullName`; `@NotBlank @Email` on `email`; `@NotBlank @Pattern(regexp="^\\+?[0-9]{7,15}$")` on `phone`; `@NotBlank @Size(min=8)` on `password`; `@NotBlank` on `passwordConfirmation` (cross-field equality is checked manually in `UserService`, there is no `@AssertTrue`/class-level cross-field annotation).
  - `CreateListingRequest`: `@NotBlank @Size(min=5,max=100)` on `title`; `@NotBlank @Size(min=20,max=1000)` on `description`; `@NotBlank` on `listingType`; `@NotNull` on `categoryId`; `@NotNull @DecimalMin("0.01")` on `price`; `@NotNull` on `campusLocationId`; no annotations at all on `currency`, `stockQuantity`, `imageUrls` (all optional at the annotation level, though `stockQuantity` becomes a hard business-logic requirement for `listingType == "product"`, enforced in code rather than via `@NotNull`/conditional validation).

- **Admin analytics screen's data source**: **partially wired to a real endpoint, partially still mock data** — verified directly in `artifacts/mockup-sandbox/src/pages/admin/analytics.tsx`:
  - The six stat cards (Total Users, New This Week, Active Listings, Total Messages, Total Reviews, Avg Rating) and the "Listings by Category" bar chart **are** driven by a real fetch: `useEffect(() => { apiGet<any>("/admin/analytics/overview").then(setAnalytics) }, [])` (line 32-36), which hits the real `GET /api/v1/admin/analytics/overview` documented in §1.6.
  - However, there's a field mismatch: the frontend reads `analytics?.new_users_this_week`, but the actual backend response (`AdminController.getAnalyticsOverview`) **never sets a `new_users_this_week` key** — only `total_users`, `total_active_listings`, `total_messages_sent`, `total_reviews_submitted`, `listings_by_category`, and `platform_avg_rating`. That stat card silently renders `0` (via the `?? 0` fallback) in production, not real data.
  - The "Daily Active Users" line chart (users/searches/messages over the last 7 days) is **not** wired to any endpoint at all — it renders a hard-coded local constant, `const dailyData = [{date:"Mon",users:12,...}, ...]` (lines 15-23), with fixed Monday–Sunday mock values that never change regardless of real activity. The date-range picker (`fromDate`/`toDate` inputs) is also cosmetic: it's included in the CSV export filename/rows but is never sent as a query parameter to the backend (and the backend's `dateFrom`/`dateTo` params on that endpoint are, as noted in §1.6, accepted but unused server-side too — so date filtering doesn't exist end-to-end on either side).
