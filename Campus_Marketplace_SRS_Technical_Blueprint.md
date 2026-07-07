# CAMPUS SERVICE MARKETPLACE PLATFORM
## Master Software Requirements Specification (SRS) & Technical Blueprint

**Document type:** Engineering master specification
**Source:** Derived from the approved Victoria University Final Year Project proposal
**Status:** Approved for implementation
**Prepared for use by:** Claude Code, Cursor, Windsurf, Replit AI, Bolt.new, Lovable, Figma AI, and human engineers
**Stack:** React + Tailwind CSS (frontend, hosted on Vercel) · Django + Django REST Framework + PostgreSQL (backend, hosted on Render)
**Timeline reference:** May–July 2026 (12-week Agile build, per proposal)
**Team:** Richard Seko Anundu (Frontend Lead), Taban James (Backend Lead)

> **How to use this document:** This is the single source of truth for the system. Every section is self-contained but consistent with every other section — the same entity names, field names, and endpoint paths are reused across the Database, API, Backend, and Frontend sections so an AI coding agent can implement any section without re-deriving names used elsewhere. Build in the order given in Section 15.

---

## TABLE OF CONTENTS

1. Project Overview
2. User Roles
3. Complete Feature Inventory
4. User Stories
5. User Flows
6. Database Design
7. API Design
8. Frontend Architecture
9. UI/UX Design Specification
10. Backend Architecture
11. Recommendation Engine
12. Admin Panel
13. Testing Plan
14. Development Roadmap
15. Lovable / Claude Code Build Plan

---

# SECTION 1: PROJECT OVERVIEW

## 1.1 Problem Being Solved

Victoria University students currently discover campus services (printing, device repair, tutoring, hair and beauty, laundry, event planning) and campus products (lecture notes, snacks, beauty items, second-hand textbooks) through **unstructured WhatsApp groups, word of mouth, and physical notice boards**. This creates four concrete, solvable problems:

1. **Discovery is scattered.** There is no single searchable index of who offers what.
2. **Trust is unverifiable.** There is no rating, review, or transaction history to judge a provider or seller before engaging them.
3. **Communication is fragmented.** Negotiation happens across many disconnected chat threads with no persistent record tied to a specific listing.
4. **There is no personalization.** Every student sees the same scattered information regardless of their location on campus, their needs, or their history.

The Campus Service Marketplace Platform solves this by being a **single, searchable, trust-scored, personalized web application** limited to the Victoria University community.

## 1.2 Target Users

| User Type | Description |
|---|---|
| **Student Customer (Seeker/Buyer)** | Any registered VU student looking for a service or product |
| **Service Provider** | A VU student who lists and delivers a service (e.g., laptop repair, tutoring) |
| **Product Seller** | A VU student who lists and sells a physical product (e.g., lecture notes, snacks) |
| **Combined Provider/Seller** | A VU student who simultaneously lists services and products, and may also seek services themselves |
| **Administrator** | The project team (Richard and Taban), responsible for moderation, verification, and platform health |

Every account is, by default, a **Seeker** (can browse, search, message, and review). A user becomes a **Provider** and/or **Seller** by enabling those roles on their profile — this is not a separate account type but a set of permission flags on one account, which is why a "Combined Provider/Seller" is simply a user with both flags enabled.

## 1.3 Business Goals

- Validate that a campus-bounded, trust-scored marketplace increases the speed and safety of peer-to-peer service/product discovery.
- Demonstrate a working, deployed, publicly accessible system as the final year project deliverable.
- Achieve pilot-stage adoption sufficient to prove the concept (see success metrics below).
- Produce documentation and code quality suitable for both academic defense and potential post-graduation continuation.

## 1.4 User Goals

- **Seekers** want to find a trustworthy provider/seller in under two minutes, with visible pricing and ratings, without leaving the platform to negotiate.
- **Providers/Sellers** want a professional shop-front that reaches more customers than a WhatsApp group and builds a durable reputation.
- **Administrators** want visibility into platform health and the ability to remove bad actors quickly.

## 1.5 Success Metrics

| Metric | Target |
|---|---|
| Registered users (pilot) | ≥ 30 |
| Active listings (pilot) | ≥ 20 across all 6 categories |
| System Usability Scale (SUS) score | ≥ 70 / 100 |
| Core feature usage rate (search, messaging, reviews) | Used by ≥ 80% of pilot participants |
| Recommendation engagement (click-through on "Recommended for You") | Measurable and greater than random-order baseline |
| Critical defect count at UAT | 0 unresolved blocking bugs at submission |
| Platform uptime during pilot | ≥ 95% |

## 1.6 Functional Scope (In Scope)

- User registration, authentication, and role management (Seeker / Provider / Seller / Admin)
- Profile creation and management
- Service and product listing CRUD (create, read, update, delete)
- Category-based browsing (6 starter categories)
- Search with keyword, category, price, location, and rating filters
- In-platform, per-listing messaging (no external chat app required)
- Ratings and reviews after a transaction
- A weighted-score recommendation engine (rating + location + preference — **no machine learning**)
- In-app notifications (new message, new review, listing status changes)
- Admin dashboard: user management, content moderation, review/report moderation, basic analytics

## 1.7 Non-Functional Scope (Out of Scope, and Quality Attributes)

**Explicitly out of scope** (per the approved proposal):
- Online payment integration (users arrange payment off-platform)
- A dedicated native mobile app (delivered instead as a responsive web app)
- GPS-based real-time location tracking (campus location is a selected value from a fixed list, not device geolocation)
- Machine learning of any kind in the recommendation engine (weighted arithmetic scoring only)

**Quality attributes (non-functional requirements) that ARE in scope:**

| Attribute | Requirement |
|---|---|
| Performance | API responses < 500ms for search/listing endpoints under pilot load (≤100 concurrent users) |
| Security | Passwords hashed (bcrypt/Argon2 via Django's auth system); JWT-based authentication; role-based access control on every endpoint; input validation and sanitization against SQL injection/XSS |
| Scalability | Architecture supports horizontal scaling of the Django API behind Render; PostgreSQL indexed for the pilot's expected data volumes |
| Usability | Mobile-first responsive design (majority of students access via phone browsers); WCAG-aware basic accessibility (contrast, alt text, keyboard navigation) |
| Reliability | Graceful error handling and user-facing error messages on all forms and API failures |
| Maintainability | Modular Django apps, typed serializers, componentized React frontend, documented API (this specification) |
| Browser compatibility | Latest two versions of Chrome, Firefox, Safari, and Edge; iOS Safari and Android Chrome for mobile |
| Data privacy | Only university email + student-provided data is stored; no data is shared with third parties; users can deactivate their account |


---

# SECTION 2: USER ROLES

> **Design note:** Roles are implemented as **permission flags on a single `User` model**, not separate account types. Every authenticated user is implicitly a Seeker. `is_provider` and `is_seller` are independent booleans a user can toggle on their own profile at any time (subject to admin verification rules in Section 12). `is_admin` is set only by existing admins/backend seed, never self-service.

## 2.1 Student Customer (Seeker / Buyer)

**Definition:** Any authenticated student whose goal is to find and engage a service provider or product seller. This is the default state of every account.

**Permissions:**
- Register, log in, log out, manage own profile
- Browse all active listings and categories
- Search and filter listings
- View any provider/seller public profile and their ratings/reviews
- Start a conversation (message) with a provider/seller about a specific listing
- Leave one review per completed transaction (one review per listing per reviewer, enforced at the database level)
- Receive personalized recommendations on their home dashboard
- Save/favorite listings (Phase 3 feature)
- Report a listing, review, or user for abuse

**Restrictions:**
- Cannot create service or product listings unless `is_provider` or `is_seller` is enabled on their profile
- Cannot review a listing they have not messaged/engaged with (prevents fake reviews) — enforced by requiring an existing `Conversation` between reviewer and listing owner before a `Review` can be submitted
- Cannot edit or delete another user's listing, message, or review
- Cannot access the Admin Dashboard

**Capabilities Summary:** Discover → Compare → Contact → Transact (off-platform) → Review

**User Journey:**
1. Lands on the platform (via shared link/QR code from campus promotion)
2. Registers with university email
3. Browses homepage — sees "Recommended for You" and category tiles
4. Searches "laptop repair" or browses the Device Repair category
5. Filters by rating ≥ 4 stars and campus location = "Main Campus"
6. Opens a listing, reads description, price, and existing reviews
7. Clicks "Message Provider" and negotiates details in-platform
8. Meets the provider off-platform to receive the service and pay
9. Returns to the platform and leaves a star rating + written review
10. Sees the provider's updated rating reflect their feedback

## 2.2 Service Provider

**Definition:** A student with `is_provider = true`, who lists one or more services.

**Permissions (in addition to all Seeker permissions):**
- Create, edit, deactivate, and delete their own service listings
- Upload photos to their listings
- View and reply to messages from seekers about their listings
- View their own aggregate rating, review count, and per-listing analytics (view count, message count)
- Toggle a listing's status: Active / Paused / Deleted

**Restrictions:**
- Cannot edit or moderate another provider's listings
- Cannot see who viewed their listing (only aggregate counts, not identities) — privacy by design
- Cannot fabricate reviews on their own listings (enforced: `reviewer_id != reviewee_id` constraint)
- Subject to admin suspension if reported and confirmed in violation of platform rules

**Capabilities Summary:** List → Advertise → Respond to inquiries → Get rated → Build reputation

**User Journey:**
1. Registers as a Seeker, then enables "I want to offer services" in profile settings
2. Fills in the "Create Listing" form: title, category, description, price, campus location, photos
3. Publishes listing — it becomes searchable and appears in relevant category pages
4. Receives an in-app notification when a seeker messages them
5. Replies to negotiate scope, price, and timing
6. Delivers the service off-platform
7. Receives a review and rating from the seeker, visible on their public profile
8. Edits or pauses the listing when unavailable (e.g., during exams)

## 2.3 Product Seller

**Definition:** A student with `is_seller = true`, who lists one or more physical products.

**Permissions (in addition to all Seeker permissions):**
- Create, edit, deactivate, and delete their own product listings
- Manage a simple stock quantity field per product (e.g., "5 units left")
- Upload photos to their listings
- View and reply to messages from buyers
- View their own aggregate rating and per-listing analytics

**Restrictions:**
- Same restrictions as Service Provider (cannot moderate, cannot self-review, subject to admin suspension)
- Stock quantity of 0 automatically flags the listing as "Out of Stock" and removes it from active search results (but keeps it visible on the seller's profile as inactive)

**Capabilities Summary:** Stock → List → Sell → Restock or delist → Get rated

**User Journey:**
1. Registers as a Seeker, then enables "I want to sell products" in profile settings
2. Creates a listing for, e.g., "Second-Hand Discrete Mathematics Textbook" with price and quantity = 1
3. Buyer messages interest; seller confirms availability and arranges handover
4. Seller marks quantity as 0 after the sale, which auto-deactivates the listing
5. Buyer leaves a review after receiving the product

## 2.4 Combined Provider/Seller

**Definition:** A student with both `is_provider = true` and `is_seller = true`. This is not a separate role in the data model — it is simply a user who has enabled both flags — but it is called out explicitly because the UI and journeys differ slightly (a combined dashboard, mixed listing types on one profile).

**Permissions:** Union of Service Provider and Product Seller permissions above.

**Restrictions:** Same as both roles individually; no additional restrictions, but their profile displays both a "Services Offered" and "Products for Sale" section.

**Capabilities Summary:** All Provider capabilities + all Seller capabilities on one unified profile.

**User Journey:**
1. A hairdresser who also sells beauty products enables both `is_provider` and `is_seller`
2. Creates a "Hair Styling (Braids, Weaves)" service listing under Hair & Beauty
3. Creates a "Braiding Extensions Pack" product listing under Campus Products
4. Both appear on their single public profile, grouped by type, with one combined rating computed across all their listings

## 2.5 Administrator

**Definition:** A project-team account with `is_admin = true`, responsible for platform integrity. Not self-registrable — created directly in the database/Django admin by the development team.

**Permissions:**
- Full read access to all users, listings, messages (metadata only, not message content, unless investigating a report), reviews, and reports
- Suspend or reactivate a user account
- Deactivate or delete any listing that violates guidelines
- Resolve, dismiss, or escalate reports filed by users
- Remove individual reviews found to be fraudulent or abusive
- View platform analytics dashboard (user growth, listing counts, category distribution, engagement)
- Verify a provider/seller (optional trust badge — Phase 3)

**Restrictions:**
- Cannot edit the content of a user's listing on their behalf (can only deactivate/delete, preserving user authorship integrity)
- Cannot read private message content unless a report has been filed referencing that conversation (privacy safeguard, enforced at the application logic layer, logged in `AdminActionLog`)
- All destructive admin actions (delete, suspend) are logged in an immutable `AdminActionLog` table for accountability

**Capabilities Summary:** Monitor → Investigate → Moderate → Report

**User Journey:**
1. Logs into `/admin-dashboard` (separate route, requires `is_admin`)
2. Sees a queue of pending reports sorted by recency
3. Opens a report on a listing flagged as "misleading price"
4. Reviews the listing, the reporter's message, and the provider's history
5. Chooses an action: Dismiss report / Warn user / Deactivate listing / Suspend user
6. Action is recorded in the admin action log with a timestamp and reason
7. Periodically reviews the Analytics tab to track weekly active users and category growth

---

# SECTION 3: COMPLETE FEATURE INVENTORY

> Every feature below maps directly to a database table (Section 6), an API endpoint (Section 7), and a frontend screen (Section 8). Feature codes (e.g., `AUTH-01`) are referenced throughout the rest of this document for traceability.

## 3.1 GROUP: AUTHENTICATION

### AUTH-01: Student Registration
- **Purpose:** Allow a new student to create an account using their university (or personal) email.
- **Inputs:** full_name (string), email (string, unique), phone (string), password (string), password_confirmation (string)
- **Outputs:** Created `User` record; JWT access + refresh token pair; redirect to onboarding/profile setup
- **Validation rules:**
  - Email must be valid format and unique in the database
  - Password minimum 8 characters, at least one letter and one number
  - password_confirmation must match password
  - Phone must be a valid Uganda-format number (e.g., `+2567XXXXXXXX` or `07XXXXXXXX`)
  - full_name required, 2–100 characters
- **Edge cases:**
  - Duplicate email → 409 Conflict with clear message "An account with this email already exists"
  - Weak password → 400 with specific rule violated
  - Registration during a temporary backend outage → frontend shows a retry-able error, does not lose form input

### AUTH-02: Student Login
- **Purpose:** Authenticate an existing user and issue session tokens.
- **Inputs:** email, password
- **Outputs:** JWT access token (short-lived, 15 min), JWT refresh token (long-lived, 7 days), user profile summary
- **Validation rules:** Both fields required; rate-limited to 5 attempts per 15 minutes per IP to slow brute-force attempts
- **Edge cases:**
  - Wrong password → 401, generic "Invalid email or password" (does not reveal which field was wrong, to avoid user enumeration)
  - Suspended account → 403 with message "Your account has been suspended. Contact support."
  - Already-logged-in user hitting login page → redirect straight to dashboard

### AUTH-03: Token Refresh
- **Purpose:** Silently renew an expired access token using a valid refresh token, so the user is not logged out every 15 minutes.
- **Inputs:** refresh_token
- **Outputs:** New access_token (and, with rotation enabled, a new refresh_token)
- **Validation rules:** Refresh token must be valid, non-expired, and non-blacklisted
- **Edge cases:** Expired/blacklisted refresh token → 401, frontend force-redirects to login

### AUTH-04: Logout
- **Purpose:** Invalidate the current session.
- **Inputs:** refresh_token (to blacklist it server-side)
- **Outputs:** 205 Reset Content; frontend clears local token storage
- **Validation rules:** Must be authenticated to call
- **Edge cases:** Logout called with an already-invalid token → still returns success (idempotent) to avoid confusing errors on the client

### AUTH-05: Password Reset Request & Confirm
- **Purpose:** Allow a user who forgot their password to regain access via email-based reset link.
- **Inputs (request step):** email
- **Inputs (confirm step):** reset_token, new_password, new_password_confirmation
- **Outputs:** Email dispatched with a time-limited reset link (request step); password updated + all existing sessions invalidated (confirm step)
- **Validation rules:** Reset token valid for 30 minutes only; new password subject to the same strength rules as AUTH-01
- **Edge cases:**
  - Requesting a reset for a non-existent email → generic success message returned regardless (prevents user enumeration), but no email is actually sent
  - Expired token used at confirm step → 400 "This link has expired, please request a new one"

## 3.2 GROUP: PROFILES

### PROF-01: View Own Profile
- **Purpose:** Let a user see their full profile including private fields (email, phone).
- **Inputs:** None (uses authenticated user context)
- **Outputs:** Full profile object: name, email, phone, bio, photo, campus_location, role flags, aggregate rating (if provider/seller), join date
- **Validation rules:** Must be authenticated
- **Edge cases:** None significant — always available for a logged-in user

### PROF-02: View Public Profile (Another User)
- **Purpose:** Let any user view another student's public-facing profile (e.g., before messaging a provider).
- **Inputs:** user_id (URL path parameter)
- **Outputs:** Public subset only: name, photo, bio, campus_location (general area, not precise), role badges, aggregate rating, review count, list of active listings. Email and phone are **never** exposed here.
- **Validation rules:** Target user must exist and not be deactivated
- **Edge cases:** Viewing a suspended/deleted user's profile → 404 "This profile is no longer available"

### PROF-03: Edit Profile
- **Purpose:** Let a user update their own name, bio, phone, campus location, and photo.
- **Inputs:** full_name, bio, phone, campus_location_id, profile_photo (image upload)
- **Outputs:** Updated `User` record
- **Validation rules:** Same phone/name validation as registration; photo must be JPEG/PNG under 5MB
- **Edge cases:** Oversized image upload → 413 with clear message; unsupported file type rejected client-side before upload attempt

### PROF-04: Toggle Provider/Seller Role
- **Purpose:** Let a user enable or disable "I offer services" and/or "I sell products" on their account.
- **Inputs:** is_provider (bool), is_seller (bool)
- **Outputs:** Updated role flags; if a role is disabled while listings exist, those listings are auto-paused (not deleted)
- **Validation rules:** At least a confirmation prompt when disabling a role that has active listings, warning the user their listings will be paused
- **Edge cases:** Disabling `is_provider` with active service listings → listings set to `status = paused`, hidden from search, but recoverable if role is re-enabled

### PROF-05: Account Deactivation (Self-Service)
- **Purpose:** Let a user deactivate (soft-delete) their own account, in line with the data-privacy NFR.
- **Inputs:** password (re-confirmation), reason (optional, free text)
- **Outputs:** `User.is_active = false`; all listings set to inactive; user logged out
- **Validation rules:** Requires password re-entry as a safety confirmation
- **Edge cases:** Deactivated account attempts login → 403 "This account has been deactivated"

## 3.3 GROUP: MARKETPLACE (LISTINGS)

### LIST-01: Create Listing
- **Purpose:** Let a Provider or Seller publish a new service or product listing.
- **Inputs:** title, description, listing_type (service|product), category_id, price, currency (default UGX), stock_quantity (nullable, products only), campus_location_id, images[] (up to 5)
- **Outputs:** Created `Listing` record with `status = active`
- **Validation rules:**
  - title: 5–100 characters
  - description: 20–1000 characters
  - price: positive number, max 2 decimal places
  - listing_type = "product" requires stock_quantity ≥ 0; listing_type = "service" ignores stock_quantity
  - category_id must reference an existing, active category
  - User must have the corresponding role flag (`is_provider` for services, `is_seller` for products) enabled before this endpoint accepts the request
- **Edge cases:**
  - User without the role flag attempts to create a listing → 403 "Enable Provider/Seller mode in your profile first," with a direct link to PROF-04
  - More than 5 images uploaded → only first 5 accepted, warning shown
  - Category/listing_type mismatch (e.g., product listing under a service-only category) → 400 with guidance

### LIST-02: Edit Listing
- **Purpose:** Let the owner update their existing listing's details.
- **Inputs:** Same fields as LIST-01 (all optional/partial update)
- **Outputs:** Updated `Listing` record, `updated_at` refreshed
- **Validation rules:** Same as LIST-01 for any field being changed; only the owner or an admin may call this
- **Edge cases:** Attempt to edit another user's listing → 403; editing a deleted listing → 404

### LIST-03: Delete Listing
- **Purpose:** Let the owner (or admin) remove a listing permanently.
- **Inputs:** listing_id
- **Outputs:** Listing status set to `deleted` (soft delete — preserves review/message history integrity)
- **Validation rules:** Only owner or admin
- **Edge cases:** Deleting a listing with an active conversation → conversation remains accessible in Messages but is marked "Listing no longer available"

### LIST-04: Toggle Listing Status (Active/Paused)
- **Purpose:** Let an owner temporarily hide a listing without deleting it (e.g., "fully booked this week").
- **Inputs:** status (active|paused)
- **Outputs:** Updated status; paused listings excluded from search and category browsing but still visible on the owner's own profile as "Paused"
- **Validation rules:** Only owner or admin
- **Edge cases:** N/A

### LIST-05: View Listing Detail
- **Purpose:** Show full details of a single listing to any visitor.
- **Inputs:** listing_id
- **Outputs:** Full listing (title, description, price, images, category, campus_location, owner's public profile summary, aggregate rating for this listing, recent reviews)
- **Validation rules:** Listing must be `active` for non-owners; owner and admin can view any status
- **Edge cases:** Viewing a deleted/paused listing as a regular visitor → 404 "This listing is no longer available"; each valid view increments a `ListingView` record used later by the Recommendation Engine (Section 11)

### LIST-06: My Listings (Owner Management View)
- **Purpose:** Let a Provider/Seller see all their own listings regardless of status, with basic per-listing stats.
- **Inputs:** None (uses authenticated user)
- **Outputs:** List of listings with status, view_count, message_count, average rating per listing
- **Validation rules:** Must be authenticated; only shows the caller's own listings
- **Edge cases:** Empty state for a new provider with zero listings — shown with a call-to-action to create their first listing

### LIST-07: Image Upload for Listing
- **Purpose:** Attach one or more images to a listing.
- **Inputs:** listing_id, image file(s)
- **Outputs:** Created `ListingImage` record(s) with public URL
- **Validation rules:** JPEG/PNG only, max 5MB per image, max 5 images per listing
- **Edge cases:** Upload failure mid-batch → already-uploaded images are kept, failed ones reported individually

## 3.4 GROUP: SEARCH

### SRCH-01: Keyword Search
- **Purpose:** Let a seeker find listings matching free-text keywords across title and description.
- **Inputs:** query (string)
- **Outputs:** Ranked list of matching active listings
- **Validation rules:** query must be at least 2 characters; sanitized against SQL injection (parameterized ORM queries only, never raw string concatenation)
- **Edge cases:** No results → friendly empty state with suggestion to browse categories instead; every valid search is logged to `SearchLog` for the Recommendation Engine's preference scoring

### SRCH-02: Filter by Category, Price, Location, Rating
- **Purpose:** Narrow search/browse results using structured filters.
- **Inputs:** category_id (optional), min_price, max_price (optional), campus_location_id (optional), min_rating (optional, 1–5)
- **Outputs:** Filtered, paginated list of listings
- **Validation rules:** min_price ≤ max_price when both provided; min_rating between 1 and 5
- **Edge cases:** Contradictory filters (e.g., min_price > max_price) → 400 with a clear message rather than a silently empty result

### SRCH-03: Sort Results
- **Purpose:** Let the user reorder results.
- **Inputs:** sort_by (relevance|price_asc|price_desc|rating_desc|newest)
- **Outputs:** Reordered result set
- **Validation rules:** sort_by must be one of the enumerated values
- **Edge cases:** Invalid sort_by value → falls back to default "relevance" rather than erroring, to keep the UI resilient

### SRCH-04: Combined Search + Recommendation Blend (Home Feed)
- **Purpose:** Power the personalized homepage feed described in Section 11.
- **Inputs:** None beyond authenticated user context
- **Outputs:** Listings ordered by `recommendation_score` descending
- **Validation rules:** See Section 11 for full scoring logic
- **Edge cases:** New user with no search/view history → falls back gracefully to rating + location only (see Section 11 cold-start handling)

## 3.5 GROUP: CATEGORIES

### CAT-01: List All Categories
- **Purpose:** Show the 6 starter categories on the homepage and navigation.
- **Inputs:** None
- **Outputs:** List of categories with name, icon, listing_type_hint, and active listing count
- **Validation rules:** Only categories marked `is_active = true` returned
- **Edge cases:** A category with zero current listings still displays (with an empty state), so students know the category exists and can be first to list in it

### CAT-02: View Category Page
- **Purpose:** Show all active listings within one category.
- **Inputs:** category_id or slug
- **Outputs:** Paginated listings within that category, with the same filter/sort controls as SRCH-02/03
- **Validation rules:** category must exist and be active
- **Edge cases:** Invalid/retired category slug → 404 with a link back to the category list

### CAT-03: Admin Category Management
- **Purpose:** Let an admin add, rename, or retire a category as the platform's needs evolve.
- **Inputs:** name, listing_type_hint, icon, is_active
- **Outputs:** Created/updated `Category` record
- **Validation rules:** Admin-only; name must be unique
- **Edge cases:** Retiring a category with active listings → listings remain visible under that (now hidden-from-nav) category but the category no longer appears in primary navigation

## 3.6 GROUP: MESSAGING

### MSG-01: Start Conversation
- **Purpose:** Let a seeker initiate a conversation with a provider/seller about a specific listing.
- **Inputs:** listing_id, initial_message (string)
- **Outputs:** Created `Conversation` record (if one doesn't already exist between these two users for this listing) + first `Message` record
- **Validation rules:** initial_message 1–1000 characters; cannot message yourself (owner cannot start a conversation on their own listing)
- **Edge cases:** Seeker already has an open conversation with this provider about this listing → reuses the existing conversation instead of creating a duplicate

### MSG-02: Send Message
- **Purpose:** Send a message within an existing conversation.
- **Inputs:** conversation_id, body (string)
- **Outputs:** Created `Message` record; triggers a `Notification` to the recipient (NOTIF-01)
- **Validation rules:** body 1–1000 characters; sender must be a participant in the conversation
- **Edge cases:** Message sent to a conversation about a now-deleted listing → still allowed (conversation persists independently of listing lifecycle) but UI shows "Listing no longer available"

### MSG-03: List My Conversations (Inbox)
- **Purpose:** Show all conversations a user is part of, sorted by most recent activity.
- **Inputs:** None (authenticated user context)
- **Outputs:** List of conversations with the other participant's name/photo, listing title, last message preview, unread count, last_message_at
- **Validation rules:** Only returns conversations where the user is a participant
- **Edge cases:** Empty inbox for a new user → friendly empty state

### MSG-04: View Conversation Thread
- **Purpose:** Show the full message history of one conversation.
- **Inputs:** conversation_id
- **Outputs:** All messages in chronological order; marks unread messages as read on load
- **Validation rules:** Caller must be a participant
- **Edge cases:** Non-participant attempts to view → 403

### MSG-05: Mark Messages as Read
- **Purpose:** Clear the unread badge when a user opens a conversation.
- **Inputs:** conversation_id
- **Outputs:** All unread messages in that conversation (sent to this user) flagged `is_read = true`
- **Validation rules:** Caller must be a participant
- **Edge cases:** Idempotent — calling twice has no adverse effect

## 3.7 GROUP: RATINGS

### RATE-01: Submit a Rating (part of Review)
- **Purpose:** Capture a 1–5 star score as part of a review submission (ratings and reviews are submitted together as one `Review` object — see REV-01).
- **Inputs:** rating (integer 1–5)
- **Outputs:** Stored on the `Review` record
- **Validation rules:** Must be an integer between 1 and 5 inclusive
- **Edge cases:** Non-integer or out-of-range value → 400 validation error

### RATE-02: Aggregate Rating Calculation
- **Purpose:** Compute and cache a provider/seller's overall average rating and a listing's specific average rating.
- **Inputs:** Triggered automatically whenever a `Review` is created, updated, or deleted
- **Outputs:** Updated `avg_rating` and `rating_count` denormalized fields on both the `Listing` and the owning `User`
- **Validation rules:** Recalculated as `SUM(rating)/COUNT(rating)`, rounded to 1 decimal place
- **Edge cases:** Zero reviews → `avg_rating = null` (displayed as "No ratings yet" rather than 0, which would look like a negative signal)

## 3.8 GROUP: REVIEWS

### REV-01: Submit a Review
- **Purpose:** Let a seeker leave a rating + written comment on a listing after engaging its owner.
- **Inputs:** listing_id, rating (1–5), comment (string, optional but recommended)
- **Outputs:** Created `Review` record; triggers RATE-02 recalculation and a `Notification` to the listing owner
- **Validation rules:**
  - Reviewer must have an existing `Conversation` with the listing owner about this listing (prevents drive-by fake reviews)
  - One review per (reviewer, listing) pair — enforced by a unique database constraint
  - comment max 500 characters
  - Cannot review your own listing
- **Edge cases:** Attempt to review the same listing twice → 409 "You have already reviewed this listing" with an option to edit the existing review instead (REV-02)

### REV-02: Edit Own Review
- **Purpose:** Let a reviewer update their rating/comment (e.g., after a resolved dispute).
- **Inputs:** review_id, rating, comment
- **Outputs:** Updated `Review`; triggers RATE-02 recalculation
- **Validation rules:** Only the original reviewer may edit
- **Edge cases:** Edited more than 30 days after original submission → still allowed in MVP (no time lock), flagged as a possible Phase 3 restriction

### REV-03: Delete Own Review
- **Purpose:** Let a reviewer remove their review.
- **Inputs:** review_id
- **Outputs:** Review soft-deleted; triggers RATE-02 recalculation
- **Validation rules:** Only the original reviewer, or an admin (moderation), may delete
- **Edge cases:** N/A

### REV-04: View Reviews for a Listing/Provider
- **Purpose:** Display all reviews on a listing detail page and on a provider's public profile.
- **Inputs:** listing_id or user_id
- **Outputs:** Paginated list of reviews with reviewer name/photo, rating, comment, date
- **Validation rules:** Only non-deleted reviews returned
- **Edge cases:** No reviews yet → "Be the first to review this provider" empty state

## 3.9 GROUP: RECOMMENDATIONS

*(Full algorithmic detail is in Section 11; this entry covers the feature-level contract.)*

### REC-01: Get Personalized Homepage Recommendations
- **Purpose:** Return a ranked list of listings tailored to the logged-in student.
- **Inputs:** None beyond authenticated user context (uses their rating history exposure, campus_location, and SearchLog/ListingView history server-side)
- **Outputs:** Ranked list of listings with a `recommendation_score` (0.0–1.0) attached to each, used for ordering only (score itself is not displayed to the end user — only the resulting order and a "Recommended for You" label)
- **Validation rules:** See Section 11 formula
- **Edge cases:** Brand-new user with zero history → cold-start fallback (Section 11.5)

### REC-02: Log Interaction Signal
- **Purpose:** Record a search or a listing view so future recommendations improve.
- **Inputs:** Implicit — triggered automatically by SRCH-01 (search) and LIST-05 (view), not a user-facing action
- **Outputs:** New `SearchLog` or `ListingView` record
- **Validation rules:** None user-facing
- **Edge cases:** Anonymous/unauthenticated browsing (if allowed) does not log to a user's personal history


## 3.10 GROUP: NOTIFICATIONS

### NOTIF-01: In-App Notification Creation
- **Purpose:** Alert a user to relevant events: new message, new review received, report resolution, listing status change by admin.
- **Inputs:** Triggered server-side by other features (MSG-02, REV-01, admin actions)
- **Outputs:** Created `Notification` record; unread count badge updates on next frontend poll/fetch
- **Validation rules:** N/A (system-generated)
- **Edge cases:** High-frequency messages in a short burst → notifications are still created individually but the frontend groups them visually as "3 new messages from Jane"

### NOTIF-02: List My Notifications
- **Purpose:** Show a chronological feed of a user's notifications.
- **Inputs:** None (authenticated user context)
- **Outputs:** Paginated list with type, title, body, related object link, is_read, created_at
- **Validation rules:** Only the owner's notifications are returned
- **Edge cases:** Empty state for a new user

### NOTIF-03: Mark Notification(s) as Read
- **Purpose:** Clear the unread badge.
- **Inputs:** notification_id (single) or bulk "mark all as read"
- **Outputs:** Updated is_read flags
- **Validation rules:** Only the owner may mark their own notifications
- **Edge cases:** Idempotent

## 3.11 GROUP: ADMIN

### ADM-01: List All Users
- **Purpose:** Let an admin browse/search all registered users.
- **Inputs:** Optional search query, filter by role/status
- **Outputs:** Paginated user list with key fields (name, email, roles, status, join date, listing count, report count)
- **Validation rules:** Admin-only
- **Edge cases:** N/A

### ADM-02: Suspend / Reactivate User
- **Purpose:** Let an admin disable a problematic account or restore one.
- **Inputs:** user_id, action (suspend|reactivate), reason
- **Outputs:** Updated `User.is_active`/`is_suspended`; logged to `AdminActionLog`; user notified via email/notification of the action and reason
- **Validation rules:** Admin-only; reason required for suspension
- **Edge cases:** Suspending a user with active conversations → conversations remain visible to the other party but marked "This user's account is currently suspended"

### ADM-03: Deactivate/Delete Any Listing
- **Purpose:** Let an admin remove a listing that violates guidelines.
- **Inputs:** listing_id, reason
- **Outputs:** Listing status updated; owner notified; logged to `AdminActionLog`
- **Validation rules:** Admin-only; reason required
- **Edge cases:** N/A

### ADM-04: Verify Provider/Seller (Trust Badge — Phase 3)
- **Purpose:** Let an admin award a "Verified" badge to a provider/seller after manual identity/skill confirmation.
- **Inputs:** user_id
- **Outputs:** `User.is_verified = true`; badge appears on public profile
- **Validation rules:** Admin-only
- **Edge cases:** N/A (Phase 3 / stretch feature, not MVP-blocking)

## 3.12 GROUP: ANALYTICS

### AN-01: Platform Overview Dashboard
- **Purpose:** Give admins a snapshot of platform health.
- **Inputs:** Optional date range filter
- **Outputs:** Total users, new users this week, total active listings, listings by category breakdown, total messages sent, total reviews submitted, average platform-wide rating
- **Validation rules:** Admin-only
- **Edge cases:** Zero-data states (e.g., first week of pilot) render as "0" or "Not enough data yet," not broken charts

### AN-02: Engagement Report Export
- **Purpose:** Export key metrics for the final project report / defense.
- **Inputs:** Date range
- **Outputs:** CSV or on-screen table of daily active users, searches performed, messages sent, reviews submitted
- **Validation rules:** Admin-only
- **Edge cases:** N/A

## 3.13 GROUP: MODERATION

### MOD-01: Report a Listing, Review, or User
- **Purpose:** Let any user flag inappropriate content or behaviour.
- **Inputs:** target_type (listing|review|user), target_id, reason (enum: misleading, inappropriate, scam, other), description (free text)
- **Outputs:** Created `Report` record with `status = pending`; visible in the Admin moderation queue
- **Validation rules:** description required if reason = "other"; a user cannot submit more than 3 open reports on the same target (anti-abuse of the reporting system itself)
- **Edge cases:** Reporting your own content → technically allowed but flagged for admin attention as unusual

### MOD-02: Review Moderation Queue
- **Purpose:** Let an admin process pending reports in order.
- **Inputs:** Optional filter by target_type or status
- **Outputs:** Paginated list of reports with full context (target content snapshot, reporter, reason, description, timestamp)
- **Validation rules:** Admin-only
- **Edge cases:** N/A

### MOD-03: Resolve a Report
- **Purpose:** Close out a report with a recorded decision.
- **Inputs:** report_id, resolution (dismissed|action_taken), resolution_notes, linked_action (optional reference to ADM-02/ADM-03 if action was taken)
- **Outputs:** Updated `Report.status`, `resolved_by`, `resolved_at`; reporter notified of the outcome
- **Validation rules:** Admin-only
- **Edge cases:** N/A

---

# SECTION 4: USER STORIES

## 4.1 Authentication & Profile Stories

1. As a **new student**, I want to register with my email and a password, so that I can create an account on the platform.
2. As a **returning student**, I want to log in with my email and password, so that I can access my account.
3. As a **logged-in student**, I want to stay logged in without re-entering my password every 15 minutes, so that my experience feels seamless.
4. As a **student**, I want to log out from any device, so that my account stays secure on shared computers.
5. As a **student who forgot my password**, I want to reset it via email, so that I can regain access without contacting an admin.
6. As a **student**, I want to edit my name, bio, phone, campus location, and photo, so that my profile accurately represents me.
7. As a **student**, I want to enable "Provider" mode, so that I can start listing services.
8. As a **student**, I want to enable "Seller" mode, so that I can start listing products.
9. As a **student**, I want to enable both Provider and Seller mode, so that I can offer services and sell products from one profile.
10. As a **student**, I want to deactivate my account if I no longer want to use the platform, so that my data is not kept active without my consent.

## 4.2 Marketplace / Listing Stories

11. As a **service provider**, I want to create a listing with a title, description, price, category, and photos, so that seekers can find and evaluate my service.
12. As a **product seller**, I want to create a listing with a stock quantity, so that buyers know how many items are available.
13. As a **provider/seller**, I want to edit my listing details, so that I can correct mistakes or update pricing.
14. As a **provider/seller**, I want to pause a listing temporarily, so that I don't receive inquiries when I'm unavailable (e.g., during exams).
15. As a **provider/seller**, I want to delete a listing I no longer offer, so that it stops appearing in search.
16. As a **provider/seller**, I want to see all my own listings with view and message counts, so that I can track interest in my offerings.
17. As a **seeker**, I want to view a listing's full details, including photos and reviews, so that I can decide whether to contact the provider.
18. As a **provider/seller**, I want my product listing to automatically show as "Out of Stock" when quantity reaches zero, so that I don't get messages for items I can't fulfill.

## 4.3 Search & Category Stories

19. As a **student**, I want to search for "laptop repair" by keyword, so that I can quickly find someone to fix my laptop.
20. As a **student**, I want to filter search results by category, price range, campus location, and minimum rating, so that I only see relevant, trustworthy options.
21. As a **student**, I want to sort results by rating or price, so that I can prioritize what matters most to me.
22. As a **student**, I want to browse fixed categories (Printing, Device Repair, Tutoring, Hair & Beauty, Laundry & Events, Campus Products) from the homepage, so that I can explore without needing exact search terms.
23. As a **student**, I want to see how many listings exist in each category before clicking in, so that I know what to expect.

## 4.4 Messaging Stories

24. As a **seeker**, I want to message a provider directly about their listing, so that I can ask questions or arrange a transaction without leaving the platform.
25. As a **provider/seller**, I want to see all my conversations in one inbox, so that I can manage inquiries efficiently.
26. As a **user**, I want to see an unread message badge, so that I know when I have new messages waiting.
27. As a **user**, I want my messages marked as read automatically when I open a conversation, so that my inbox stays organized.
28. As a **user**, I want to see the full message history in a conversation, so that I can recall what was already discussed.

## 4.5 Ratings & Reviews Stories

29. As a **seeker**, I want to leave a star rating and written review after using a service or buying a product, so that I can share my experience with other students.
30. As a **seeker**, I want to edit my review if my opinion changes or I made a mistake, so that my feedback stays accurate.
31. As a **provider/seller**, I want to see my average rating and all reviews on my profile, so that I can build and showcase my reputation.
32. As a **seeker**, I want to be prevented from reviewing a provider I've never contacted, so that the review system stays honest.
33. As a **provider/seller**, I want to be notified when I receive a new review, so that I can respond to feedback promptly.

## 4.6 Recommendation Stories

34. As a **student**, I want my homepage to show services and products relevant to me, so that I don't have to browse everything manually.
35. As a **student**, I want listings near my campus location to be prioritized, so that I can get services conveniently.
36. As a **student**, I want highly-rated providers to appear higher in my recommendations, so that I engage with trustworthy people first.
37. As a **student**, I want my past searches to influence what's recommended to me, so that the platform feels personalized over time.
38. As a **new student with no history**, I want to still see useful recommendations based on rating and location alone, so that the platform is useful from my very first visit.

## 4.7 Notification Stories

39. As a **user**, I want to be notified when someone messages me, so that I can respond quickly.
40. As a **user**, I want to be notified when I receive a new review, so that I know my reputation has updated.
41. As a **user**, I want to mark notifications as read individually or all at once, so that I can manage my notification feed.

## 4.8 Admin Stories

42. As an **admin**, I want to see a list of all registered users, so that I can monitor platform growth and identify problem accounts.
43. As an **admin**, I want to suspend a user who violates platform rules, so that I can protect other students.
44. As an **admin**, I want to deactivate a listing that is misleading or inappropriate, so that the marketplace stays trustworthy.
45. As an **admin**, I want to see a queue of reported content, so that I can act on user concerns promptly.
46. As an **admin**, I want to resolve a report with a documented decision, so that there's an accountable record of moderation actions.
47. As an **admin**, I want to view platform analytics (users, listings, engagement), so that I can track project success metrics for my final year defense.

## 4.9 Moderation (User-Facing) Stories

48. As a **user**, I want to report a listing that looks like a scam, so that admins can investigate it.
49. As a **user**, I want to report an abusive or inappropriate review, so that it can be removed if it violates guidelines.
50. As a **user**, I want to be notified of the outcome of my report, so that I know my concern was addressed.

---

# SECTION 5: USER FLOWS

## 5.1 Registration Flow

**Main Flow:**
1. User lands on `/register`
2. Enters full name, email, phone, password, password confirmation
3. Clicks "Create Account"
4. Frontend validates fields client-side (format, matching passwords)
5. Frontend calls `POST /api/v1/auth/register/`
6. Backend validates uniqueness of email, password strength, phone format
7. Backend creates `User` record, hashes password, returns JWT pair
8. Frontend stores tokens, redirects to `/onboarding` (optional: pick campus location, enable provider/seller mode)
9. User lands on `/dashboard` (Home Feed)

**Alternative Flow — Skip Onboarding:**
3a. User clicks "Skip for now" on `/onboarding` → redirected straight to `/dashboard` with default Seeker-only role

**Error Flow — Duplicate Email:**
6a. Backend returns 409 → frontend shows inline error under the email field: "An account with this email already exists. [Log in instead]"

**Error Flow — Weak Password:**
6b. Backend returns 400 with specific rule → frontend highlights the password field with the exact unmet rule (e.g., "Add at least one number")

**Error Flow — Network Failure:**
5a. Request times out → frontend shows a toast: "Something went wrong. Please try again," preserves all entered form values (does not clear the form)

## 5.2 Login Flow

**Main Flow:**
1. User lands on `/login`
2. Enters email and password
3. Clicks "Log In"
4. Frontend calls `POST /api/v1/auth/login/`
5. Backend verifies credentials, returns JWT pair + user summary
6. Frontend stores tokens, redirects to `/dashboard`

**Alternative Flow — Already Authenticated:**
1a. A logged-in user navigating to `/login` is immediately redirected to `/dashboard`

**Error Flow — Invalid Credentials:**
5a. Backend returns 401 → frontend shows generic error: "Invalid email or password" (never specifies which)

**Error Flow — Suspended Account:**
5b. Backend returns 403 with `reason: suspended` → frontend shows: "Your account has been suspended. Contact the platform admin for details."

**Error Flow — Rate Limited:**
4a. More than 5 failed attempts in 15 minutes → backend returns 429 → frontend shows: "Too many attempts. Please wait a few minutes and try again."

## 5.3 Creating a Listing Flow

**Main Flow:**
1. Provider/Seller clicks "+ New Listing" from `/dashboard` or `/my-listings`
2. Redirected to `/listings/new`
3. Selects listing type (Service or Product) — this filters the category dropdown to relevant categories
4. Fills title, description, price, category, campus location
5. If Product: enters stock quantity
6. Uploads up to 5 photos (drag-and-drop or file picker)
7. Clicks "Publish Listing"
8. Frontend validates all fields client-side
9. Frontend calls `POST /api/v1/listings/` with multipart form data
10. Backend validates role flag, field constraints, creates `Listing` + `ListingImage` records
11. Frontend redirects to the new listing's detail page with a success toast: "Your listing is live!"

**Alternative Flow — Save as Draft (Phase 3):**
7a. User clicks "Save as Draft" instead → listing created with `status = draft`, not publicly visible, editable later from `/my-listings`

**Error Flow — Role Not Enabled:**
10a. Backend returns 403 `role_required` → frontend shows a modal: "You need to enable Provider mode to create a service listing. [Enable now]" linking to profile settings (PROF-04)

**Error Flow — Validation Failure:**
10b. Backend returns 400 with field-level errors → frontend highlights each invalid field inline without losing other entered data

**Error Flow — Image Upload Failure:**
6a. One image fails to upload (e.g., too large) → that image shows a red X with "File too large (max 5MB)," other successfully uploaded images remain, user can retry or remove the failed one

## 5.4 Searching Flow

**Main Flow:**
1. User types a keyword into the search bar on `/dashboard` or `/search`
2. Frontend debounces input (300ms) then calls `GET /api/v1/listings/search/?q={query}`
3. Backend logs the query to `SearchLog` (if authenticated), executes keyword search against active listings
4. Results render as a paginated grid of listing cards
5. User applies filters (category, price range, location, rating) via the filter sidebar/drawer
6. Frontend re-calls the search endpoint with filter parameters appended
7. User selects a sort order (relevance/price/rating/newest)
8. Results re-render in the new order

**Alternative Flow — Browse Without Searching:**
1a. User clicks a category tile directly from the homepage instead of typing → routes to `/categories/{slug}` (CAT-02) which reuses the same filter/sort UI

**Error Flow — No Results:**
4a. Zero matches → empty state: "No listings match your search. Try different keywords or [browse all categories]."

**Error Flow — Contradictory Filters:**
6a. min_price > max_price submitted → frontend validates before the API call and shows an inline warning, preventing the request

## 5.5 Contacting a Provider Flow

**Main Flow:**
1. Seeker is on a listing detail page (`/listings/{id}`)
2. Clicks "Message Provider"
3. If no existing conversation: a compose box appears inline; seeker types an initial message and clicks "Send"
4. Frontend calls `POST /api/v1/conversations/` with `listing_id` and `initial_message`
5. Backend creates `Conversation` + first `Message`, creates a `Notification` for the provider
6. Frontend redirects seeker to `/messages/{conversation_id}` showing the new thread
7. Provider receives a notification badge; opens `/messages/{conversation_id}` to reply
8. Both parties exchange messages until arrangements are finalized off-platform

**Alternative Flow — Existing Conversation:**
3a. If a conversation already exists between this seeker and this listing owner for this listing, clicking "Message Provider" routes directly to the existing thread instead of creating a duplicate

**Error Flow — Messaging Own Listing:**
2a. Owner viewing their own listing does not see a "Message Provider" button at all (frontend hides it); if somehow called directly, backend returns 400 "You cannot message yourself"

**Error Flow — Message to a Deleted Listing's Owner:**
4a. If the listing was deleted between page load and send, backend still creates the conversation (owner and seeker can still coordinate) but flags it "Regarding: [Listing no longer available]"

## 5.6 Leaving a Review Flow

**Main Flow:**
1. Seeker, having previously messaged a provider about a listing, navigates to that listing's detail page or their own "Past Interactions" list
2. Clicks "Leave a Review"
3. Modal/form appears: star rating (1–5, required) + comment (optional, up to 500 characters)
4. Clicks "Submit Review"
5. Frontend calls `POST /api/v1/reviews/`
6. Backend validates an existing conversation exists between reviewer and listing owner, validates one-review-per-listing constraint, creates `Review`
7. Backend recalculates and caches the listing's and owner's aggregate rating (RATE-02)
8. Backend creates a `Notification` for the listing owner
9. Frontend shows the new review immediately on the listing page and a success toast

**Alternative Flow — Edit Existing Review:**
6a. If a review already exists for this (reviewer, listing) pair, the "Leave a Review" button instead reads "Edit Your Review" and pre-fills the existing rating/comment; submission calls `PATCH /api/v1/reviews/{id}/` instead

**Error Flow — No Prior Contact:**
6b. Backend returns 403 "You need to have messaged this provider before leaving a review" if no `Conversation` exists — frontend hides the review button entirely in this case as the primary safeguard, with the API check as a defense-in-depth backstop

**Error Flow — Self-Review Attempt:**
6c. Backend returns 400 if `reviewer_id == listing.owner_id` (frontend also hides this button on the owner's own listings)

## 5.7 Receiving a Review Flow (Provider/Seller Perspective)

**Main Flow:**
1. Provider/Seller receives an in-app `Notification`: "You received a new 5-star review from [Seeker Name]"
2. Clicks the notification, routes to their own public profile `/profile/{id}` or the specific listing
3. Sees the new review listed alongside past reviews, and their aggregate rating updated
4. (No reply/response feature in MVP — flagged as a Phase 3 enhancement: "Provider can publicly respond to a review")

**Alternative Flow — Review Triggers a Rating Milestone:**
3a. If this review pushes the provider's aggregate rating across a notable threshold (e.g., first review ever, or reaching 4.5+ with 10+ reviews), the frontend may show a small congratulatory banner (nice-to-have, not required for MVP)

**Error Flow — Disputes a Review as Unfair:**
4a. Provider uses MOD-01 to report the review itself as abusive/false → routes into the standard moderation queue (Section 5.8)

## 5.8 Admin Moderation Flow

**Main Flow:**
1. Admin logs into `/admin-dashboard` (requires `is_admin = true`, enforced both by route guard on the frontend and permission check on every backend endpoint)
2. Navigates to "Reports" tab, sees a queue of `status = pending` reports sorted oldest-first
3. Clicks a report to see full context: reported content snapshot, reporter identity, reason, description, and the target user's history (past reports, account age)
4. Chooses an action:
   - **Dismiss** — no action taken, reporter is notified the report was reviewed and dismissed
   - **Warn** — a notification is sent to the target user citing the platform guideline in question, report marked resolved
   - **Deactivate Listing** — calls ADM-03, report marked resolved with `linked_action` reference
   - **Suspend User** — calls ADM-02, report marked resolved with `linked_action` reference
5. Backend logs the action in `AdminActionLog` with admin_id, action, target, timestamp, and notes
6. Reporter receives a notification of the outcome

**Alternative Flow — Escalation Between Two Admins (Phase 3):**
4a. Admin marks a report "Needs second opinion" instead of resolving it directly → visible to both team members before final resolution (not required for a 2-person admin team but designed to extend cleanly)

**Error Flow — Report on Already-Deleted Content:**
3a. If the reported listing/review was already removed by its owner before the admin reviews it, the admin still sees the report with a note "Content no longer exists" and can resolve it as "No action needed"

## 5.9 Recommendation Generation Flow

**Main Flow (executed server-side on every home feed request):**
1. Authenticated user requests `GET /api/v1/recommendations/`
2. Backend fetches candidate pool: all `active` listings excluding the user's own
3. For each candidate listing, backend computes:
   - **Rating Score** = `listing.owner.avg_rating / 5` (or a neutral default if no ratings exist yet — see 5.9a)
   - **Location Score** = 1.0 if `listing.campus_location == user.campus_location`; 0.5 if in an adjacent zone (per a fixed adjacency map); else 0.0
   - **Preference Score** = ratio of the user's past search/view interactions in this listing's category vs. their total interactions across all categories (or a neutral default if the user has no history)
4. Backend computes `recommendation_score = (0.4 × Rating Score) + (0.3 × Location Score) + (0.3 × Preference Score)`
5. Candidates sorted descending by `recommendation_score`; top N (e.g., 20) returned, paginated
6. Frontend renders these under a "Recommended for You" section on `/dashboard`

**Alternative Flow — Cold Start (New User, No History):**
3a. If the user has zero `SearchLog`/`ListingView` records, Preference Score defaults to a neutral `1 / total_category_count` for every category (equal weighting), so the ranking effectively becomes rating + location only until real history accumulates — see Section 11.5 for full detail

**Error Flow — No Candidate Listings Available:**
2a. If there are zero active listings platform-wide (e.g., very first day of pilot), the endpoint returns an empty list and the frontend shows: "No listings yet — check back soon, or be the first to create one!"

**Error Flow — Missing User Campus Location:**
3b. If the user has not set a `campus_location` on their profile, Location Score defaults to 0.5 (neutral) for all candidates rather than 0.0, so their recommendations aren't unfairly penalized before onboarding is complete

---

# SECTION 6: DATABASE DESIGN

**Database Engine:** PostgreSQL 15+ (hosted on Render)
**ORM:** Django ORM
**Naming convention:** snake_case table and column names; Django will pluralize table names automatically (e.g., model `Listing` → table `listings_listing` under the `listings` app — simplified table names shown below for clarity)

## 6.1 Table: `users`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | NOT NULL |
| bio | TEXT | NULLABLE |
| profile_photo_url | VARCHAR(500) | NULLABLE |
| campus_location_id | BIGINT | FOREIGN KEY → campus_locations.id, NULLABLE |
| is_provider | BOOLEAN | DEFAULT FALSE |
| is_seller | BOOLEAN | DEFAULT FALSE |
| is_admin | BOOLEAN | DEFAULT FALSE |
| is_verified | BOOLEAN | DEFAULT FALSE |
| is_active | BOOLEAN | DEFAULT TRUE |
| is_suspended | BOOLEAN | DEFAULT FALSE |
| avg_rating | DECIMAL(2,1) | NULLABLE (denormalized cache) |
| rating_count | INTEGER | DEFAULT 0 (denormalized cache) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.2 Table: `campus_locations`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| name | VARCHAR(100) | UNIQUE, NOT NULL (e.g., "Main Campus", "Annex", "Hostel Area A") |
| zone | VARCHAR(50) | NOT NULL (used for adjacency scoring, e.g., "central", "north", "south") |
| is_active | BOOLEAN | DEFAULT TRUE |

*Seed data: Main Campus (zone: central), Annex (zone: north), Hostel Area A (zone: south), Hostel Area B (zone: south). Zone adjacency (which zones count as "nearby" = 0.5 score) is a small fixed lookup defined in application code, not a database table, since it rarely changes — see Section 11.*

## 6.3 Table: `categories`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| name | VARCHAR(100) | UNIQUE, NOT NULL |
| slug | VARCHAR(100) | UNIQUE, NOT NULL |
| listing_type_hint | VARCHAR(10) | ENUM('service','product','both'), NOT NULL |
| icon_name | VARCHAR(50) | NULLABLE (frontend icon reference) |
| description | VARCHAR(255) | NULLABLE |
| is_active | BOOLEAN | DEFAULT TRUE |

*Seed data (the 6 starter categories from the proposal):*
1. Printing & Photocopying (service)
2. Device Repair (service)
3. Tutoring (service)
4. Hair & Beauty (both)
5. Laundry & Event Planning (service)
6. Campus Products (product)

## 6.4 Table: `listings`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| owner_id | BIGINT | FOREIGN KEY → users.id, NOT NULL |
| category_id | BIGINT | FOREIGN KEY → categories.id, NOT NULL |
| listing_type | VARCHAR(10) | ENUM('service','product'), NOT NULL |
| title | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(150) | UNIQUE, NOT NULL |
| description | TEXT | NOT NULL |
| price | DECIMAL(10,2) | NOT NULL, CHECK (price >= 0) |
| currency | VARCHAR(3) | DEFAULT 'UGX' |
| stock_quantity | INTEGER | NULLABLE (products only; NULL for services) |
| campus_location_id | BIGINT | FOREIGN KEY → campus_locations.id, NOT NULL |
| status | VARCHAR(10) | ENUM('active','paused','draft','deleted'), DEFAULT 'active' |
| view_count | INTEGER | DEFAULT 0 (denormalized cache) |
| message_count | INTEGER | DEFAULT 0 (denormalized cache) |
| avg_rating | DECIMAL(2,1) | NULLABLE (denormalized cache, listing-specific) |
| rating_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Constraint:** `CHECK (listing_type != 'product' OR stock_quantity IS NOT NULL)` — products must declare a stock quantity.

## 6.5 Table: `listing_images`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| listing_id | BIGINT | FOREIGN KEY → listings.id, NOT NULL, ON DELETE CASCADE |
| image_url | VARCHAR(500) | NOT NULL |
| sort_order | SMALLINT | DEFAULT 0 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.6 Table: `conversations`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| listing_id | BIGINT | FOREIGN KEY → listings.id, NULLABLE, ON DELETE SET NULL |
| initiator_id | BIGINT | FOREIGN KEY → users.id, NOT NULL (the seeker who started it) |
| recipient_id | BIGINT | FOREIGN KEY → users.id, NOT NULL (the listing owner) |
| last_message_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Constraint:** `UNIQUE(listing_id, initiator_id, recipient_id)` — prevents duplicate conversation threads for the same seeker/listing pair (MSG-01 edge case).

## 6.7 Table: `messages`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| conversation_id | BIGINT | FOREIGN KEY → conversations.id, NOT NULL, ON DELETE CASCADE |
| sender_id | BIGINT | FOREIGN KEY → users.id, NOT NULL |
| body | VARCHAR(1000) | NOT NULL |
| is_read | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.8 Table: `reviews`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| listing_id | BIGINT | FOREIGN KEY → listings.id, NOT NULL |
| reviewer_id | BIGINT | FOREIGN KEY → users.id, NOT NULL |
| reviewee_id | BIGINT | FOREIGN KEY → users.id, NOT NULL (denormalized copy of listing.owner_id at time of review, for query efficiency) |
| rating | SMALLINT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| comment | VARCHAR(500) | NULLABLE |
| is_deleted | BOOLEAN | DEFAULT FALSE (soft delete) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Constraints:**
- `UNIQUE(listing_id, reviewer_id)` — one review per listing per reviewer
- `CHECK (reviewer_id != reviewee_id)` — cannot review yourself

## 6.9 Table: `search_logs`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users.id, NULLABLE (nullable to allow anonymous search logging if ever needed) |
| query_text | VARCHAR(255) | NOT NULL |
| category_id | BIGINT | FOREIGN KEY → categories.id, NULLABLE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.10 Table: `listing_views`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users.id, NULLABLE |
| listing_id | BIGINT | FOREIGN KEY → listings.id, NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.11 Table: `favorites` *(Phase 3)*

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users.id, NOT NULL |
| listing_id | BIGINT | FOREIGN KEY → listings.id, NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

**Constraint:** `UNIQUE(user_id, listing_id)`

## 6.12 Table: `reports`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| reporter_id | BIGINT | FOREIGN KEY → users.id, NOT NULL |
| target_type | VARCHAR(10) | ENUM('listing','review','user'), NOT NULL |
| target_id | BIGINT | NOT NULL (polymorphic reference, resolved in application logic based on target_type) |
| reason | VARCHAR(20) | ENUM('misleading','inappropriate','scam','other'), NOT NULL |
| description | VARCHAR(500) | NULLABLE |
| status | VARCHAR(10) | ENUM('pending','resolved','dismissed'), DEFAULT 'pending' |
| resolved_by_id | BIGINT | FOREIGN KEY → users.id, NULLABLE |
| resolution_notes | VARCHAR(500) | NULLABLE |
| resolved_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.13 Table: `notifications`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| user_id | BIGINT | FOREIGN KEY → users.id, NOT NULL |
| notif_type | VARCHAR(30) | ENUM('new_message','new_review','report_resolved','admin_action','listing_status_change'), NOT NULL |
| title | VARCHAR(150) | NOT NULL |
| body | VARCHAR(500) | NULLABLE |
| related_type | VARCHAR(20) | NULLABLE (e.g., 'conversation', 'listing', 'review') |
| related_id | BIGINT | NULLABLE |
| is_read | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.14 Table: `admin_action_logs`

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PRIMARY KEY, AUTO INCREMENT |
| admin_id | BIGINT | FOREIGN KEY → users.id, NOT NULL |
| action | VARCHAR(30) | ENUM('suspend_user','reactivate_user','deactivate_listing','delete_listing','delete_review','resolve_report','verify_user'), NOT NULL |
| target_type | VARCHAR(20) | NOT NULL |
| target_id | BIGINT | NOT NULL |
| notes | VARCHAR(500) | NULLABLE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## 6.15 Entity Relationship Description (ERD Narrative)

```
users ──1───────∞── listings              (a user owns many listings)
users ──1───────∞── reviews (as reviewer)  (a user writes many reviews)
users ──1───────∞── reviews (as reviewee)  (a user receives many reviews)
users ──1───────∞── conversations (as initiator or recipient)
users ──1───────∞── messages (as sender)
users ──1───────∞── search_logs
users ──1───────∞── listing_views
users ──1───────∞── reports (as reporter)
users ──1───────∞── notifications
users ──1───────∞── admin_action_logs (as admin)
users ──∞───────1── campus_locations    (many users live in one campus location)

categories ──1───────∞── listings

listings ──1───────∞── listing_images
listings ──1───────∞── reviews
listings ──1───────∞── conversations
listings ──1───────∞── search_logs (via category, indirectly)
listings ──1───────∞── listing_views
listings ──∞───────1── campus_locations

conversations ──1───────∞── messages
```

**Textual ERD summary:** At the center of the schema is `users`, which owns `listings` (1-to-many). Each `listing` belongs to one `category` and one `campus_location`, and can have many `listing_images`. Two users interacting over a listing create a `conversation`, which contains many `messages`. After a conversation exists, a `review` can be created linking a `listing`, its `reviewer`, and its `reviewee` (the listing owner). `search_logs` and `listing_views` are lightweight interaction logs feeding the Recommendation Engine (Section 11). `reports` and `admin_action_logs` support the moderation subsystem (Section 12), with `reports.target_id` resolved polymorphically against `listings`, `reviews`, or `users` depending on `target_type`.

## 6.16 Normalization Explanation

The schema is normalized to **Third Normal Form (3NF)** with deliberate, documented denormalization for performance:

- **1NF:** Every column holds a single atomic value (e.g., no comma-separated lists); every table has a primary key.
- **2NF:** Every non-key column depends on the whole primary key — trivially satisfied since every table uses a single-column surrogate `id` primary key rather than composite keys.
- **3NF:** Every non-key column depends only on the primary key, not on other non-key columns. For example, `listings` does not store `owner_name` (that would depend on `owner_id`, not on the listing's own primary key) — it stores only `owner_id` and joins to `users` when the name is needed.

**Deliberate denormalization (for read performance, clearly justified):**
- `users.avg_rating` / `users.rating_count` and `listings.avg_rating` / `listings.rating_count` are cached aggregates recalculated on every review write (RATE-02). Without this, every listing card rendered in a search results page would require a live `AVG()` aggregation over the reviews table, which does not scale well for a homepage feed showing 20+ listings at once. The cache is kept consistent by recalculating synchronously inside the same database transaction as any review create/update/delete.
- `listings.view_count` and `listings.message_count` are similarly cached counters, incremented transactionally, to avoid `COUNT()` queries on every listing card render.
- `reviews.reviewee_id` duplicates information derivable from `reviews.listing_id → listings.owner_id`, but is stored directly to allow efficient "all reviews received by this user across all their listings" queries without an extra join, which is needed for the public profile page (PROF-02).

This is a standard, defensible pattern: normalize for data integrity, then denormalize narrowly and only where a specific, named query pattern requires it, keeping the source of truth (the `reviews` table itself) fully normalized underneath the caches.

---

# SECTION 7: API DESIGN

**Base URL:** `https://api.campusmarketplace.app/api/v1/` (Render-hosted)
**Authentication scheme:** JWT Bearer token in `Authorization: Bearer <access_token>` header, unless marked "Public"
**Response envelope:** All list endpoints return `{ "count": int, "next": url|null, "previous": url|null, "results": [...] }` (Django REST Framework pagination default)
**Error envelope:** `{ "detail": "human-readable message", "errors": { "field_name": ["specific error"] } }`

## 7.1 Authentication Endpoints

### `POST /auth/register/`
- **Auth:** Public
- **Request body:**
```json
{
  "full_name": "Richard Seko Anundu",
  "email": "richard@students.vu.ac.ug",
  "phone": "+256700000000",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123"
}
```
- **Response (201):**
```json
{
  "user": { "id": 1, "full_name": "Richard Seko Anundu", "email": "richard@students.vu.ac.ug", "is_provider": false, "is_seller": false },
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### `POST /auth/login/`
- **Auth:** Public
- **Request body:** `{ "email": "...", "password": "..." }`
- **Response (200):** Same shape as register response

### `POST /auth/refresh/`
- **Auth:** Public (requires valid refresh_token in body)
- **Request body:** `{ "refresh_token": "eyJ..." }`
- **Response (200):** `{ "access_token": "eyJ..." }`

### `POST /auth/logout/`
- **Auth:** Required
- **Request body:** `{ "refresh_token": "eyJ..." }`
- **Response (205):** No content

### `POST /auth/password-reset/`
- **Auth:** Public
- **Request body:** `{ "email": "..." }`
- **Response (200):** `{ "detail": "If this email exists, a reset link has been sent." }`

### `POST /auth/password-reset-confirm/`
- **Auth:** Public
- **Request body:** `{ "reset_token": "...", "new_password": "...", "new_password_confirmation": "..." }`
- **Response (200):** `{ "detail": "Password updated successfully." }`

### `GET /auth/me/`
- **Auth:** Required
- **Response (200):** Full own-profile object (see PROF-01)

## 7.2 User / Profile Endpoints

### `GET /users/{id}/`
- **Auth:** Required
- **Response (200):** Public profile subset (PROF-02) — `id, full_name, profile_photo_url, bio, campus_location, is_provider, is_seller, is_verified, avg_rating, rating_count, listings: [...]`

### `PATCH /users/me/`
- **Auth:** Required
- **Request body (any subset):** `{ "full_name", "bio", "phone", "campus_location_id", "profile_photo" }`
- **Response (200):** Updated own-profile object

### `PATCH /users/me/roles/`
- **Auth:** Required
- **Request body:** `{ "is_provider": true, "is_seller": false }`
- **Response (200):** Updated role flags

### `POST /users/me/deactivate/`
- **Auth:** Required
- **Request body:** `{ "password": "...", "reason": "optional text" }`
- **Response (200):** `{ "detail": "Account deactivated." }`

## 7.3 Category Endpoints

### `GET /categories/`
- **Auth:** Public
- **Response (200):** `{ "results": [ { "id": 1, "name": "Device Repair", "slug": "device-repair", "listing_type_hint": "service", "icon_name": "wrench", "active_listing_count": 12 }, ... ] }`

### `GET /categories/{slug}/listings/`
- **Auth:** Public
- **Query params:** `page, page_size, min_price, max_price, campus_location_id, min_rating, sort_by`
- **Response (200):** Paginated listing list (see 7.4 listing response shape)

### `POST /admin/categories/` *(Admin only)*
- **Auth:** Required, `is_admin`
- **Request body:** `{ "name", "listing_type_hint", "icon_name", "description" }`
- **Response (201):** Created category

### `PATCH /admin/categories/{id}/` *(Admin only)*
- **Auth:** Required, `is_admin`
- **Request body:** Any subset of category fields, including `is_active`
- **Response (200):** Updated category

## 7.4 Listing Endpoints

### `GET /listings/`
- **Auth:** Public
- **Query params:** `category_id, min_price, max_price, campus_location_id, min_rating, sort_by, page`
- **Response (200):**
```json
{
  "count": 45,
  "next": "https://api.../listings/?page=2",
  "previous": null,
  "results": [
    {
      "id": 12,
      "title": "Laptop Screen & Battery Repair",
      "slug": "laptop-screen-battery-repair-12",
      "listing_type": "service",
      "category": { "id": 2, "name": "Device Repair" },
      "price": "25000.00",
      "currency": "UGX",
      "campus_location": { "id": 1, "name": "Main Campus" },
      "owner": { "id": 5, "full_name": "Taban James", "avg_rating": 4.7, "rating_count": 9 },
      "primary_image_url": "https://.../image1.jpg",
      "avg_rating": 4.8,
      "rating_count": 6,
      "status": "active",
      "created_at": "2026-06-10T10:00:00Z"
    }
  ]
}
```

### `GET /listings/search/`
- **Auth:** Public (logs to SearchLog if authenticated)
- **Query params:** `q` (required), plus all filters from `GET /listings/`
- **Response (200):** Same shape as `GET /listings/`

### `GET /listings/{id}/`
- **Auth:** Public (increments ListingView if authenticated)
- **Response (200):** Full listing detail — all fields from the list response plus `description`, `images: [...]`, `stock_quantity`, `recent_reviews: [...]`

### `POST /listings/`
- **Auth:** Required, `is_provider` (if listing_type=service) or `is_seller` (if listing_type=product)
- **Request body (multipart/form-data):** `title, description, listing_type, category_id, price, currency, stock_quantity (products only), campus_location_id, images[]`
- **Response (201):** Full created listing object

### `PATCH /listings/{id}/`
- **Auth:** Required, must be listing owner or admin
- **Request body:** Any subset of createable fields
- **Response (200):** Updated listing

### `DELETE /listings/{id}/`
- **Auth:** Required, must be listing owner or admin
- **Response (204):** No content (soft delete — status set to 'deleted')

### `PATCH /listings/{id}/status/`
- **Auth:** Required, must be listing owner or admin
- **Request body:** `{ "status": "paused" }`
- **Response (200):** Updated listing with new status

### `GET /listings/mine/`
- **Auth:** Required
- **Response (200):** Paginated list of the caller's own listings (any status), with `view_count` and `message_count` included

### `POST /listings/{id}/images/`
- **Auth:** Required, must be listing owner
- **Request body (multipart/form-data):** `image` (file)
- **Response (201):** `{ "id": 1, "image_url": "https://...", "sort_order": 0 }`

### `DELETE /listings/{id}/images/{image_id}/`
- **Auth:** Required, must be listing owner
- **Response (204):** No content

## 7.5 Messaging Endpoints

### `POST /conversations/`
- **Auth:** Required
- **Request body:** `{ "listing_id": 12, "initial_message": "Hi, is this still available?" }`
- **Response (201):** `{ "id": 8, "listing": {...}, "other_participant": {...}, "last_message_at": "...", "created_at": "..." }`

### `GET /conversations/`
- **Auth:** Required
- **Response (200):** Paginated list of the caller's conversations, sorted by `last_message_at` descending, each with `unread_count`, `last_message_preview`

### `GET /conversations/{id}/messages/`
- **Auth:** Required, must be a participant
- **Response (200):** Paginated list of messages, chronological; marks unread messages (sent to caller) as read as a side effect

### `POST /conversations/{id}/messages/`
- **Auth:** Required, must be a participant
- **Request body:** `{ "body": "Sure, are you free tomorrow at 2pm?" }`
- **Response (201):** Created message object; triggers a notification to the other participant

### `POST /conversations/{id}/mark-read/`
- **Auth:** Required, must be a participant
- **Response (200):** `{ "detail": "Marked as read." }`

## 7.6 Review Endpoints

### `POST /reviews/`
- **Auth:** Required
- **Request body:** `{ "listing_id": 12, "rating": 5, "comment": "Fixed my laptop in one day, great service!" }`
- **Response (201):** Created review object; triggers aggregate recalculation and notification
- **Error (403):** `{ "detail": "You need to have messaged this provider before leaving a review." }`
- **Error (409):** `{ "detail": "You have already reviewed this listing.", "existing_review_id": 3 }`

### `PATCH /reviews/{id}/`
- **Auth:** Required, must be the original reviewer
- **Request body:** `{ "rating": 4, "comment": "Updated comment" }`
- **Response (200):** Updated review

### `DELETE /reviews/{id}/`
- **Auth:** Required, must be the original reviewer or admin
- **Response (204):** No content (soft delete)

### `GET /listings/{id}/reviews/`
- **Auth:** Public
- **Response (200):** Paginated reviews for this listing

### `GET /users/{id}/reviews/`
- **Auth:** Public
- **Response (200):** Paginated reviews received across all of this user's listings

## 7.7 Recommendation Endpoint

### `GET /recommendations/`
- **Auth:** Required
- **Query params:** `page, page_size`
- **Response (200):** Same shape as `GET /listings/`, but ordered by computed `recommendation_score` descending (score itself included in the response for engineering/debugging visibility, but not rendered in the production UI)
```json
{
  "results": [
    { "id": 12, "title": "...", "recommendation_score": 0.87, "...": "..." }
  ]
}
```

## 7.8 Notification Endpoints

### `GET /notifications/`
- **Auth:** Required
- **Response (200):** Paginated notifications, newest first, with `unread_count` in a top-level meta field

### `POST /notifications/{id}/mark-read/`
- **Auth:** Required, must be the owner
- **Response (200):** `{ "detail": "Marked as read." }`

### `POST /notifications/mark-all-read/`
- **Auth:** Required
- **Response (200):** `{ "detail": "All notifications marked as read.", "updated_count": 5 }`

## 7.9 Moderation (User-Facing) Endpoints

### `POST /reports/`
- **Auth:** Required
- **Request body:** `{ "target_type": "listing", "target_id": 12, "reason": "scam", "description": "Price changed after I messaged them" }`
- **Response (201):** Created report object

## 7.10 Admin Endpoints

*(All endpoints below require `Auth: Required, is_admin = true`; non-admins receive 403 on every one of these.)*

### `GET /admin/users/`
- **Query params:** `search, role, status, page`
- **Response (200):** Paginated user list with admin-relevant fields (email, roles, status, join date, listing_count, report_count)

### `POST /admin/users/{id}/suspend/`
- **Request body:** `{ "reason": "Repeated scam reports" }`
- **Response (200):** Updated user object; action logged

### `POST /admin/users/{id}/reactivate/`
- **Response (200):** Updated user object; action logged

### `POST /admin/users/{id}/verify/`
- **Response (200):** Updated user object with `is_verified: true`; action logged

### `PATCH /admin/listings/{id}/status/`
- **Request body:** `{ "status": "deleted", "reason": "Misleading pricing" }`
- **Response (200):** Updated listing; owner notified; action logged

### `DELETE /admin/reviews/{id}/`
- **Request body:** `{ "reason": "Abusive language" }`
- **Response (204):** No content; action logged

### `GET /admin/reports/`
- **Query params:** `status, target_type, page`
- **Response (200):** Paginated reports with full context (target snapshot, reporter, reason)

### `POST /admin/reports/{id}/resolve/`
- **Request body:** `{ "resolution": "action_taken", "resolution_notes": "Listing deactivated", "linked_action": { "type": "deactivate_listing", "target_id": 12 } }`
- **Response (200):** Updated report; reporter notified

### `GET /admin/analytics/overview/`
- **Query params:** `date_from, date_to` (optional)
- **Response (200):**
```json
{
  "total_users": 34,
  "new_users_this_week": 6,
  "total_active_listings": 22,
  "listings_by_category": [ { "category": "Device Repair", "count": 5 }, ... ],
  "total_messages_sent": 210,
  "total_reviews_submitted": 18,
  "platform_avg_rating": 4.4
}
```

### `GET /admin/analytics/engagement-report/`
- **Query params:** `date_from, date_to, format` (json|csv)
- **Response (200):** Daily breakdown of active users, searches, messages, reviews — or a downloadable CSV if `format=csv`

---

# SECTION 8: FRONTEND ARCHITECTURE

**Framework:** React 18+ with functional components and hooks
**Styling:** Tailwind CSS
**Routing:** React Router v6
**State management:** React Context for auth/user session; TanStack Query (React Query) for server state (listings, conversations, notifications) to handle caching, loading, and error states consistently
**HTTP client:** Axios with an interceptor that attaches the JWT and handles silent token refresh (AUTH-03)

## 8.1 Route Map

| Route | Screen | Auth Required |
|---|---|---|
| `/` | Landing Page | No |
| `/register` | Registration | No (redirects if logged in) |
| `/login` | Login | No (redirects if logged in) |
| `/onboarding` | Onboarding (location + role setup) | Yes |
| `/dashboard` | Home Dashboard (personalized feed) | Yes |
| `/profile/me` | My Profile (edit) | Yes |
| `/profile/:id` | Public Profile | Yes |
| `/listings/new` | Create Listing | Yes (provider/seller) |
| `/listings/:id` | Listing Detail | Yes |
| `/listings/:id/edit` | Edit Listing | Yes (owner only) |
| `/my-listings` | My Listings (management) | Yes (provider/seller) |
| `/categories` | All Categories | Yes |
| `/categories/:slug` | Category Page | Yes |
| `/search` | Search Results | Yes |
| `/messages` | Inbox | Yes |
| `/messages/:conversationId` | Conversation Thread | Yes |
| `/notifications` | Notifications Feed | Yes |
| `/admin-dashboard` | Admin Overview | Yes (`is_admin`) |
| `/admin-dashboard/users` | Admin User Management | Yes (`is_admin`) |
| `/admin-dashboard/reports` | Admin Moderation Queue | Yes (`is_admin`) |
| `/admin-dashboard/analytics` | Admin Analytics | Yes (`is_admin`) |

## 8.2 Landing Page (`/`)
- **Purpose:** Public marketing/intro page explaining the platform to a first-time visitor before they register.
- **Components:** Hero section with headline + CTA buttons ("Get Started", "Log In"), a 3-step "How It Works" strip, a preview grid of the 6 categories (static, non-clickable teaser), footer.
- **Inputs:** None
- **Actions:** "Get Started" → `/register`; "Log In" → `/login`
- **Navigation:** Top nav with Logo, "Log In", "Register" buttons

## 8.3 Registration Screen (`/register`)
- **Purpose:** AUTH-01 — new account creation.
- **Components:** Form (full name, email, phone, password, confirm password inputs), submit button, "Already have an account? Log in" link, inline field-level error messages.
- **Inputs:** Text fields as above
- **Actions:** Submit → `POST /auth/register/` → on success, navigate to `/onboarding`
- **Navigation:** Link to `/login`

## 8.4 Login Screen (`/login`)
- **Purpose:** AUTH-02 — authentication.
- **Components:** Form (email, password), submit button, "Forgot password?" link, "New here? Register" link.
- **Inputs:** email, password
- **Actions:** Submit → `POST /auth/login/` → navigate to `/dashboard`; "Forgot password?" → password reset flow (modal or dedicated `/reset-password` screen)
- **Navigation:** Link to `/register`

## 8.5 Onboarding Screen (`/onboarding`)
- **Purpose:** Capture campus location and optional provider/seller role right after signup, so recommendations and listing creation work immediately.
- **Components:** Campus location dropdown/selector, two toggle switches ("I want to offer services" / "I want to sell products"), "Continue" and "Skip for now" buttons.
- **Inputs:** campus_location_id, is_provider, is_seller
- **Actions:** Continue → `PATCH /users/me/` + `PATCH /users/me/roles/` → navigate to `/dashboard`; Skip → navigate to `/dashboard` directly
- **Navigation:** None (linear onboarding step)

## 8.6 Home Dashboard (`/dashboard`)
- **Purpose:** The personalized landing screen after login — the core "power feature" screen showcasing REC-01.
- **Components:** Top search bar; category tile row (6 tiles with icons); "Recommended for You" horizontal scroll/grid of listing cards (from `GET /recommendations/`); "Browse by Category" section; floating "+ New Listing" button (visible only if `is_provider` or `is_seller`).
- **Inputs:** Search bar text input
- **Actions:** Search submit → `/search?q=...`; category tile click → `/categories/:slug`; listing card click → `/listings/:id`; "+ New Listing" → `/listings/new`
- **Navigation:** Persistent top nav (Logo, Search, Messages icon with unread badge, Notifications icon with unread badge, Profile avatar dropdown)

## 8.7 My Profile (`/profile/me`)
- **Purpose:** PROF-01/03/04/05 — view and edit own profile.
- **Components:** Profile photo upload, name/bio/phone/campus location fields, role toggle switches, aggregate rating display (if provider/seller), "My Listings" shortcut, "Deactivate Account" danger-zone button (with confirmation modal).
- **Inputs:** All editable profile fields
- **Actions:** Save → `PATCH /users/me/`; toggle role → `PATCH /users/me/roles/`; Deactivate → confirmation modal → `POST /users/me/deactivate/` → logout + redirect to `/`
- **Navigation:** Shortcut to `/my-listings`

## 8.8 Public Profile (`/profile/:id`)
- **Purpose:** PROF-02 — let any user view a provider/seller's public shop-front.
- **Components:** Photo, name, bio, campus location, role badges, verified badge (if applicable), aggregate rating summary, tabbed sections "Services" / "Products" showing that user's active listings, reviews list below.
- **Inputs:** None
- **Actions:** Listing card click → `/listings/:id`; "Message" shortcut on a listing card → starts MSG-01 flow
- **Navigation:** Back to previous screen

## 8.9 Create Listing (`/listings/new`)
- **Purpose:** LIST-01 — publish a new service or product listing.
- **Components:** Listing-type toggle (Service/Product) which dynamically filters the category dropdown; title, description, price, category, campus location fields; conditional stock_quantity field (products only); drag-and-drop image uploader (up to 5); "Publish" and "Save as Draft" buttons.
- **Inputs:** All fields per LIST-01
- **Actions:** Publish → `POST /listings/` → navigate to `/listings/:id` (the new listing)
- **Navigation:** Cancel → back to `/my-listings`

## 8.10 Listing Detail (`/listings/:id`)
- **Purpose:** LIST-05 — full listing view, the primary conversion screen.
- **Components:** Image carousel, title, price, category badge, campus location, description, owner mini-profile card (photo, name, rating, "View Profile" link), "Message Provider" button (hidden for own listings), reviews section below with "Leave a Review" button (conditionally shown per 5.6 rules).
- **Inputs:** None directly (review submission opens a modal — see 8.9 Review Modal below)
- **Actions:** "Message Provider" → opens compose box / MSG-01 flow → `/messages/:conversationId`; "View Profile" → `/profile/:ownerId`; "Leave a Review" → review modal → `POST /reviews/`
- **Navigation:** Back to search/category results

## 8.11 My Listings (`/my-listings`)
- **Purpose:** LIST-06 — provider/seller management view.
- **Components:** Tab or filter by status (Active/Paused/Draft/Deleted), listing cards with view_count and message_count badges, per-card menu (Edit / Pause–Activate / Delete), "+ New Listing" button.
- **Inputs:** Status filter
- **Actions:** Edit → `/listings/:id/edit`; Pause/Activate → `PATCH /listings/:id/status/`; Delete → confirmation modal → `DELETE /listings/:id/`
- **Navigation:** "+ New Listing" → `/listings/new`

## 8.12 Category Page (`/categories/:slug`)
- **Purpose:** CAT-02 — browse all listings within one category.
- **Components:** Category header (name, icon, description), filter sidebar/drawer (price range, campus location, min rating), sort dropdown, paginated listing card grid.
- **Inputs:** Filter values, sort selection
- **Actions:** Filters/sort change → re-fetch `GET /categories/:slug/listings/` with query params; listing card click → `/listings/:id`
- **Navigation:** Back to `/dashboard` or `/categories`

## 8.13 Search Results (`/search`)
- **Purpose:** SRCH-01/02/03 — keyword search with filters.
- **Components:** Same filter sidebar and card grid as Category Page, plus the search query displayed with an edit option, empty-state illustration for no results.
- **Inputs:** `q` (from URL query param), filters, sort
- **Actions:** Same as Category Page
- **Navigation:** Back to `/dashboard`

## 8.14 Messages / Inbox (`/messages`)
- **Purpose:** MSG-03 — list all conversations.
- **Components:** List of conversation preview rows (other participant photo/name, listing title, last message snippet, timestamp, unread badge).
- **Inputs:** None
- **Actions:** Row click → `/messages/:conversationId`
- **Navigation:** Persistent top nav

## 8.15 Conversation Thread (`/messages/:conversationId`)
- **Purpose:** MSG-02/04/05 — view and continue a conversation.
- **Components:** Header showing the other participant and the related listing (linked), scrollable message bubbles (sent/received styling), text input + send button at the bottom.
- **Inputs:** Message body text
- **Actions:** Send → `POST /conversations/:id/messages/`
- **Navigation:** Listing title in header links to `/listings/:id`; back arrow to `/messages`

## 8.16 Notifications Feed (`/notifications`)
- **Purpose:** NOTIF-02/03 — view all notifications.
- **Components:** List of notification rows (icon by type, title, body snippet, timestamp, read/unread styling), "Mark all as read" button.
- **Inputs:** None
- **Actions:** Row click → marks as read + navigates to `related_type`/`related_id` (e.g., a conversation or listing); "Mark all as read" → `POST /notifications/mark-all-read/`
- **Navigation:** Persistent top nav

## 8.17 Admin Dashboard — Overview (`/admin-dashboard`)
- **Purpose:** AN-01 — admin landing page.
- **Components:** KPI cards (total users, active listings, messages sent, avg rating), listings-by-category bar chart, recent reports preview widget, quick links to Users/Reports/Analytics tabs.
- **Inputs:** Optional date range picker
- **Actions:** KPI/chart data refresh on date range change; quick links navigate to sub-sections
- **Navigation:** Admin side nav (Overview / Users / Reports / Analytics)

## 8.18 Admin User Management (`/admin-dashboard/users`)
- **Purpose:** ADM-01/02/04 — manage users.
- **Components:** Searchable/filterable user table (name, email, roles, status, join date, listing count, report count), row action menu (Suspend / Reactivate / Verify).
- **Inputs:** Search query, role/status filters
- **Actions:** Suspend → confirmation modal with reason field → `POST /admin/users/:id/suspend/`; Reactivate → `POST /admin/users/:id/reactivate/`; Verify → `POST /admin/users/:id/verify/`
- **Navigation:** Admin side nav

## 8.19 Admin Moderation Queue (`/admin-dashboard/reports`)
- **Purpose:** MOD-02/03 — process reports.
- **Components:** Filterable report list (status, target_type), report detail panel (target content snapshot, reporter info, reason, description), action buttons (Dismiss / Warn / Deactivate Listing / Suspend User).
- **Inputs:** Filter values, resolution_notes text
- **Actions:** Any resolution action → `POST /admin/reports/:id/resolve/`
- **Navigation:** Admin side nav

## 8.20 Admin Analytics (`/admin-dashboard/analytics`)
- **Purpose:** AN-01/AN-02 — deeper platform metrics for the final project report.
- **Components:** Date range picker, line chart (daily active users), bar chart (listings by category), summary stat cards, "Export CSV" button.
- **Inputs:** Date range
- **Actions:** Export → `GET /admin/analytics/engagement-report/?format=csv` triggers file download
- **Navigation:** Admin side nav

---

# SECTION 9: UI/UX DESIGN SPECIFICATION

## 9.1 Design System

### 9.1.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1E3A8A` (deep indigo-blue) | Primary buttons, active nav items, links, headers |
| `primary-hover` | `#1E2F6B` | Button hover state |
| `secondary` | `#F59E0B` (warm amber) | Secondary CTAs, "Recommended for You" badge, highlights |
| `success` | `#16A34A` | Success toasts, "Active" status badge, positive ratings |
| `warning` | `#D97706` | "Paused" status badge, caution states |
| `danger` | `#DC2626` | Delete actions, error messages, "Suspended" badge |
| `neutral-900` | `#111827` | Primary text |
| `neutral-600` | `#4B5563` | Secondary text |
| `neutral-300` | `#D1D5DB` | Borders, dividers |
| `neutral-100` | `#F3F4F6` | Card backgrounds, page background |
| `white` | `#FFFFFF` | Card surfaces, modal backgrounds |

*Rationale: deep indigo-blue reads as trustworthy and institutional (echoing the university context) without copying Victoria University's exact brand colors on a student-built product; amber accent creates clear visual hierarchy for calls-to-action against the cooler primary.*

### 9.1.2 Typography

- **Font family:** `Inter` (Google Fonts) — clean, highly legible at small sizes on mobile, free
- **Scale:**
  | Style | Size | Weight | Usage |
  |---|---|---|---|
  | Display | 32px | 700 | Landing page hero only |
  | H1 | 24px | 700 | Page titles |
  | H2 | 20px | 600 | Section headers |
  | H3 | 16px | 600 | Card titles |
  | Body | 14px | 400 | Default body text |
  | Small | 12px | 400 | Metadata, timestamps, captions |
  | Button | 14px | 600 | All button labels |

### 9.1.3 Spacing Scale (Tailwind defaults used directly)
`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px` — mapped to Tailwind's `1, 2, 3, 4, 6, 8, 12, 16` spacing units. Card internal padding: `16px`. Section vertical rhythm: `32px` between major sections, `16px` between related elements.

### 9.1.4 Core Components

**Button (Primary):** `bg-primary text-white rounded-lg px-4 py-2 font-semibold hover:bg-primary-hover transition`, min touch target 44px height for mobile.

**Button (Secondary/Outline):** `border border-primary text-primary rounded-lg px-4 py-2 font-semibold hover:bg-primary hover:text-white transition`

**Button (Danger):** Same shape, `bg-danger` / `border-danger text-danger`

**Card (Listing Card):** `bg-white rounded-xl shadow-sm border border-neutral-300 overflow-hidden hover:shadow-md transition`, structure: image (16:9 top), padding-16 content area with title (H3), price (bold, primary color), category badge (small pill, neutral-100 background), owner mini-row (small avatar + name + star rating), bottom-right status badge if applicable.

**Badge (Status):** Small rounded-full pill, 12px text, color-coded: Active = success/green background at 10% opacity with success text; Paused = warning; Suspended/Deleted = danger.

**Star Rating Display:** 5 star icons, filled proportion representing decimal average (e.g., 4.5 shows 4 filled + 1 half-filled), numeric value in parentheses next to stars, review count below in `Small` text style.

**Input Field:** `border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary`, label above in `Body` weight 600, error state switches border to `danger` with an error message below in `Small danger` text.

**Filter Sidebar/Drawer:** Desktop = persistent left sidebar (240px wide); Mobile = slide-up bottom drawer triggered by a "Filters" button with an active-filter-count badge. Contains: category checkboxes, price range dual slider, campus location dropdown, minimum rating star selector, "Apply Filters" and "Clear All" buttons.

**Navigation Bar (Top, authenticated):** Fixed top, `white` background, `shadow-sm`, height 64px. Left: logo + wordmark. Center (desktop only): search bar. Right: Messages icon (with unread count badge), Notifications icon (with unread count badge), Profile avatar (dropdown: My Profile, My Listings, Settings, Log Out). On mobile, search bar moves below the nav bar as a full-width row; icons remain in the top bar.

**Modal:** Centered overlay, `white` rounded-xl, `shadow-lg`, max-width 480px, dimmed backdrop (`bg-black/40`), used for: confirmation dialogs (delete, deactivate, suspend), review submission, image upload preview.

**Toast Notification:** Bottom-right (desktop) / bottom-center (mobile) transient banner, color-coded by type (success/danger/info), auto-dismiss after 4 seconds, manual close (×) available.

### 9.1.5 Mobile Responsiveness Rules

- **Breakpoints:** `sm: 640px, md: 768px, lg: 1024px, xl: 1280px` (Tailwind defaults)
- Listing card grids: 1 column below `md`, 2 columns `md`–`lg`, 3–4 columns above `lg`
- Filter sidebar collapses into a bottom drawer below `md`
- Top nav search bar collapses to an icon that expands into a full-width overlay search input below `md`
- All touch targets ≥ 44×44px on mobile
- Bottom tab bar (mobile only, below `md`): Home, Search, Messages, Notifications, Profile — replaces relying solely on the top nav for primary navigation on small screens

## 9.2 Per-Screen UI Detail (for Figma AI generation)

### Landing Page
**Layout:** Full-width hero (100vh on desktop, auto-height on mobile) with `primary` background, centered white headline text "Find Trusted Campus Services & Products — By Students, For Students," subheadline in lighter weight, two buttons side-by-side (desktop) / stacked (mobile): "Get Started" (secondary/amber, filled) and "Log In" (outline, white border). Below the hero: a light `neutral-100` section titled "How It Works" with 3 numbered columns (Register → Discover → Connect), each with a simple icon. Below that: a "Explore Categories" preview strip showing 6 static category cards in a horizontal scroll (mobile) / grid (desktop). Footer: simple, dark `neutral-900` background, white text, links to About/Contact (placeholder), copyright line.

### Registration / Login Screens
**Layout:** Centered single-column card (max-width 400px) on a `neutral-100` full-page background, logo above the card, card contains the form with `H2` heading ("Create Your Account" / "Welcome Back"), stacked input fields with 16px gaps, primary full-width submit button, small text link below to switch between register/login. Mobile: card becomes full-width with 16px page margin instead of a floating centered card.

### Onboarding Screen
**Layout:** Same centered-card pattern, but presented as a 1-step form (not a multi-step wizard, to keep it fast): campus location as a styled dropdown/select, two toggle switches with descriptive helper text under each ("You'll be able to list services like tutoring or repairs" / "You'll be able to sell items like notes or snacks"), primary "Continue" button, text-link "Skip for now" below it.

### Home Dashboard
**Layout:** Top nav (per 9.1.4) → full-width search bar row below nav on mobile → horizontal-scroll category tile row (6 rounded-square icon tiles, icon + label, `white` background with `shadow-sm`) → "Recommended for You" section header (H2) with a small amber "Personalized" badge next to it → horizontal-scroll (mobile) / 4-column grid (desktop) of listing cards → "Browse All Categories" section with the same 6 tiles repeated as a full grid with listing counts shown. Floating action button (FAB) bottom-right on mobile for "+ New Listing" (circular, amber, plus icon) for provider/seller users only.

### Listing Detail
**Layout:** Full-width image carousel at top (dots indicator, swipeable on mobile), below it a content column (max-width 720px, centered on desktop): H1 title, price in large bold primary-color text next to a category badge, campus location with a small pin icon, owner mini-card (rounded, `neutral-100` background, avatar + name + star rating + "View Profile" link — tappable row), full description text, primary-color full-width "Message Provider" button (sticky at bottom on mobile for easy access while scrolling), divider, "Reviews" section header with average rating summary at the top, individual review cards below (avatar, name, stars, comment, relative timestamp), "Leave a Review" outline button above the review list (only shown when eligible per business rules).

### Create/Edit Listing Form
**Layout:** Single-column form, max-width 640px, centered. Top: segmented control toggle "Service / Product." Below: title input, description textarea (4 rows, character counter bottom-right), two-column row (price input + currency shown as a fixed "UGX" suffix label), category select (options filtered by the service/product toggle), campus location select, conditional stock_quantity number input (fades in only for Product type), image uploader as a row of 5 square drop-zones (filled ones show a thumbnail with a small × remove button, empty ones show a "+" icon), bottom action row: outline "Save as Draft" button + primary "Publish Listing" button.

### Category Page / Search Results
**Layout:** Page header row: category name + icon (H1) or "Search results for '...'" text, with a result count next to it. Below, a two-column layout on desktop (240px filter sidebar + flexible-width results grid) collapsing to a single column on mobile with a sticky "Filters (2)" button that opens the bottom drawer. Results render as the standard listing card grid (per 9.1.5 responsive column rules). Sort dropdown sits top-right of the results area, aligned with the result count.

### Messages / Inbox
**Layout:** Single-column list, full-height, each row: circular avatar (48px) left, middle column (other participant name in `H3`, listing title in `Small neutral-600`, last message preview truncated to one line), right column (relative timestamp in `Small`, unread count badge as a small filled amber circle if > 0). Rows separated by a thin `neutral-300` divider, entire row is tappable/clickable, subtle `neutral-100` background on hover/press.

### Conversation Thread
**Layout:** Sticky header (avatar + name of other participant + linked listing title as a small chip below the name), scrollable message area below with alternating alignment (own messages right-aligned in `primary` filled bubbles with white text; received messages left-aligned in `neutral-100` bubbles with `neutral-900` text), timestamps in `Small neutral-600` beneath each bubble or grouped by time cluster. Bottom: sticky input row (text input + circular send button, `primary` filled with a paper-plane icon), input area lifts above the mobile keyboard automatically.

### Notifications Feed
**Layout:** Single-column list similar to Inbox but with a type-specific icon (message bubble, star, shield, megaphone) in a colored circle on the left instead of an avatar, unread rows have a subtle `primary`-tinted left border (4px) and a light `primary`-tinted background, read rows are plain white. Top-right "Mark all as read" text-button.

### Admin Dashboard — Overview
**Layout:** Left side navigation rail (persistent on desktop, 220px, `neutral-900` dark background with white text/icons for Overview/Users/Reports/Analytics — visually distinct from the student-facing app to reinforce this is a control panel). Main content area: 4 KPI cards in a row (desktop) / 2×2 grid (mobile), each card: large bold number, label beneath, small trend indicator if applicable. Below: a bar chart card "Listings by Category" (using a simple charting library) and a "Recent Reports" list card showing the 5 most recent pending reports with a "View All" link.

### Admin User Management / Moderation Queue
**Layout:** Same dark side-rail pattern. Main area: a data table (striped rows, sticky header row) with sortable columns, a search input + filter dropdowns above the table, row-level action buttons/menu on the right of each row. For the Moderation Queue specifically: clicking a report row expands or navigates to a detail panel showing the reported content rendered exactly as it appears to end users (e.g., an embedded read-only listing card or review card) so the admin can judge it in context, plus the report metadata and action buttons beneath.

---

# SECTION 10: BACKEND ARCHITECTURE

## 10.1 Project Folder Structure

```
campus_marketplace_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── config/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── __init__.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── permissions.py
│   │   ├── pagination.py
│   │   ├── exceptions.py
│   │   └── utils.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── managers.py
│   │   └── tests/
│   ├── locations/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── categories/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── listings/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── permissions.py
│   │   ├── services.py
│   │   └── tests/
│   ├── messaging/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── reviews/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── services.py
│   │   └── tests/
│   ├── recommendations/
│   │   ├── services.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tests/
│   ├── notifications/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── services.py
│   │   └── tests/
│   └── moderation/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       ├── permissions.py
│       └── tests/
└── static/ (collected static files)
```

## 10.2 App Responsibilities

| App | Responsibility |
|---|---|
| `core` | Shared, cross-cutting code: base permission classes, standard pagination class, custom exception handler for consistent error envelopes, shared utility functions |
| `users` | Custom `User` model (extends `AbstractBaseUser`), registration/login/JWT views, profile management, role toggling |
| `locations` | `CampusLocation` model and read-only list endpoint; zone-adjacency lookup used by the recommendation engine |
| `categories` | `Category` model, public list/detail endpoints, admin CRUD endpoints |
| `listings` | `Listing` and `ListingImage` models, full CRUD, search/filter query logic, view-count and message-count increment logic |
| `messaging` | `Conversation` and `Message` models, conversation creation/dedup logic, unread tracking |
| `reviews` | `Review` model, one-review-per-listing enforcement, aggregate rating recalculation service |
| `recommendations` | No dedicated model (reads from `listings`, `search_logs`, `listing_views`, `reviews`); contains the scoring service described in Section 11 |
| `notifications` | `Notification` model, creation triggered by signals/service calls from other apps, list/mark-read endpoints |
| `moderation` | `Report` and `AdminActionLog` models, admin-only views for user/listing/review moderation and analytics |

*Note: `search_logs` and `listing_views` models live inside the `listings` app (as they are tightly coupled to listing browsing behaviour), not a separate app, to avoid over-fragmentation.*

## 10.3 Authentication

- **Library:** `djangorestframework-simplejwt`
- **Access token lifetime:** 15 minutes
- **Refresh token lifetime:** 7 days, rotation enabled, blacklist-after-rotation enabled (so a used refresh token cannot be replayed)
- **Custom user model:** `AUTH_USER_MODEL = 'users.User'`, using email as the `USERNAME_FIELD` instead of Django's default username field
- **Password hashing:** Django's default `PBKDF2PasswordHasher` (upgradeable to Argon2 via `django.contrib.auth.hashers.Argon2PasswordHasher` if the `argon2-cffi` package is added)

## 10.4 Permissions

Custom permission classes in `apps/core/permissions.py` and per-app `permissions.py` files:

- `IsOwnerOrReadOnly` — object-level permission: write operations restricted to the object's `owner`/`sender`/`reviewer` field matching `request.user`; read operations open to any authenticated user (used on Listings, Messages send-checks, Reviews)
- `IsAdminUser` — `request.user.is_admin == True`, used on every endpoint under `/admin/*`
- `IsProviderOrSeller` — checks `request.user.is_provider` or `request.user.is_seller` depending on the `listing_type` in the request payload, used on `POST /listings/`
- `IsConversationParticipant` — object-level permission checking `request.user.id in (conversation.initiator_id, conversation.recipient_id)`, used on all conversation/message endpoints

## 10.5 Business Logic / Services Layer

To keep views thin and testable, non-trivial business logic lives in `services.py` modules rather than directly in views:

- **`listings/services.py`**
  - `create_listing(owner, validated_data, images)` — validates role flag, creates `Listing` + `ListingImage` records transactionally
  - `increment_view_count(listing)` — atomic `F()` expression increment, also creates a `ListingView` record if the requester is authenticated
  - `search_listings(query_params)` — builds the filtered/sorted queryset used by both `GET /listings/` and `GET /listings/search/`

- **`reviews/services.py`**
  - `submit_review(reviewer, listing, rating, comment)` — validates prior-conversation requirement and uniqueness constraint, creates the `Review`, then calls `recalculate_ratings(listing)`
  - `recalculate_ratings(listing)` — recomputes and saves `listing.avg_rating`/`rating_count` and `listing.owner.avg_rating`/`rating_count`, run inside the same DB transaction as the review write

- **`recommendations/services.py`**
  - `get_recommendations(user, page)` — implements the full weighted-scoring algorithm from Section 11; called only by `GET /recommendations/`

- **`notifications/services.py`**
  - `notify(user, notif_type, title, body, related_type=None, related_id=None)` — single entry point used by other apps (messaging, reviews, moderation) to create notifications consistently, so notification-creation logic is never duplicated across apps

- **`moderation/services.py`**
  - `resolve_report(admin, report, resolution, notes, linked_action=None)` — updates the report, optionally executes the linked admin action (suspend/deactivate), writes to `AdminActionLog`, and notifies the original reporter

## 10.6 Settings Structure

- `config/settings/base.py` — shared settings (INSTALLED_APPS, MIDDLEWARE, REST_FRAMEWORK config, SIMPLE_JWT config, CORS config)
- `config/settings/development.py` — imports base, adds `DEBUG=True`, local SQLite fallback option, permissive CORS for `localhost:5173` (Vite dev server)
- `config/settings/production.py` — imports base, `DEBUG=False`, PostgreSQL via `DATABASE_URL` env var (Render-provided), `django-cors-headers` restricted to the deployed Vercel frontend origin, `SECURE_SSL_REDIRECT=True`, static files served via WhiteNoise

## 10.7 Key Third-Party Packages

| Package | Purpose |
|---|---|
| `djangorestframework` | Core API framework |
| `djangorestframework-simplejwt` | JWT authentication |
| `django-cors-headers` | CORS handling for the separate Vercel-hosted frontend |
| `django-filter` | Declarative query filtering for listings search/filter endpoints |
| `Pillow` | Image handling/validation for listing photo uploads |
| `psycopg2-binary` | PostgreSQL adapter |
| `python-decouple` or `django-environ` | Environment variable management |
| `whitenoise` | Static file serving in production |
| `gunicorn` | WSGI server for Render deployment |
| `pytest-django` | Test runner (Section 13) |

---

# SECTION 11: RECOMMENDATION ENGINE

> This is the platform's unique selling point, exactly as defined in the approved proposal: a **lightweight, weighted-score hybrid recommender — no machine learning.** It combines quality (rating), convenience (location), and personal interest (preference/search history) into one explainable score.

## 11.1 The Formula

```
recommendation_score = (0.4 × Rating_Score) + (0.3 × Location_Score) + (0.3 × Preference_Score)
```

All three sub-scores are normalized to a `0.0`–`1.0` range before weighting, so the final `recommendation_score` is also always between `0.0` and `1.0`.

## 11.2 Inputs

| Input | Source | Used For |
|---|---|---|
| `listing.owner.avg_rating` | Cached aggregate on `users` table (Section 6.1) | Rating_Score |
| `user.campus_location_id` | The requesting student's own profile | Location_Score |
| `listing.campus_location_id` | The candidate listing's location | Location_Score |
| `user`'s `SearchLog` and `ListingView` history | Section 6.9 / 6.10 tables | Preference_Score |
| `listing.category_id` | The candidate listing's category | Preference_Score |

## 11.3 Weights (Fixed, Configurable Constants)

| Component | Weight | Rationale |
|---|---|---|
| Rating Score | 0.4 | Given the highest weight because trustworthiness is the platform's core value proposition — the proposal's central problem is *lack of verified trust*, so a highly-rated provider should surface first regardless of other factors |
| Location Score | 0.3 | Convenience matters on a campus where students move between buildings on foot; being physically reachable is a strong practical factor |
| Preference Score | 0.3 | Personal relevance matters but is weighted equal to location and below rating, since early in the platform's life this signal is the least data-rich (cold-start problem) |

*These weights are defined as named constants in `recommendations/services.py` (e.g., `RATING_WEIGHT = 0.4`), not hardcoded inline, so they can be tuned later without touching the scoring logic itself.*

## 11.4 Scoring Logic (Per Sub-Score)

### 11.4.1 Rating Score
```
Rating_Score = listing.owner.avg_rating / 5.0   if avg_rating is not null
Rating_Score = 0.5                              if avg_rating is null (neutral default for brand-new providers)
```
A brand-new provider with zero reviews is not penalized to zero (which would bury them permanently) nor boosted to 1.0 (which would be gameable) — they receive a neutral 0.5, the midpoint, until real ratings accumulate.

### 11.4.2 Location Score
```
Location_Score = 1.0   if listing.campus_location.zone == user.campus_location.zone (same zone)
Location_Score = 0.5   if listing.campus_location.zone is in the ADJACENT_ZONES[user's zone] set
Location_Score = 0.0   otherwise (far)
Location_Score = 0.5   if user.campus_location is null (neutral default — user hasn't set a location yet)
```
The zone-adjacency relationship is a small, fixed lookup table defined directly in code (not a database table, since campus geography rarely changes):
```python
ADJACENT_ZONES = {
    "central": {"north", "south"},
    "north":   {"central"},
    "south":   {"central"},
}
```

### 11.4.3 Preference Score
```
user_category_interactions = COUNT(SearchLog WHERE user=user AND category=listing.category)
                            + COUNT(ListingView WHERE user=user AND listing.category=listing.category)

user_total_interactions   = COUNT(SearchLog WHERE user=user)
                            + COUNT(ListingView WHERE user=user)

Preference_Score = user_category_interactions / user_total_interactions   if user_total_interactions > 0
Preference_Score = 1.0 / total_active_category_count                      if user_total_interactions == 0 (cold start)
```
This rewards categories the student has actually engaged with (searched or viewed) proportionally to how dominant that interest is relative to their overall activity, while giving every category equal footing for a user with no history yet.

## 11.5 Cold-Start Handling (New User, Day One)

A brand-new student with zero search/view history and no set campus location will receive:
- `Rating_Score` = actual value (this is available platform-wide from day one, since it depends on providers' history, not the viewer's)
- `Location_Score` = 0.5 (neutral, until they set a location in onboarding)
- `Preference_Score` = `1 / 6` ≈ 0.167 for every category (equal weighting across the 6 starter categories)

This means a new user's very first "Recommended for You" feed is effectively **ranked almost entirely by provider rating**, which is exactly the right fallback — showing the most trustworthy providers first is a sensible default when nothing else is known about the viewer.

## 11.6 Full Worked Example

A student (`campus_location = Main Campus`, zone = `central`) has searched "tutoring" 3 times and viewed 2 tutoring listings and 1 printing listing (6 total interactions: 5 tutoring-related, 1 printing-related).

**Candidate Listing A** — a Tutoring listing, owner `avg_rating = 4.5`, location zone = `central`:
- Rating_Score = 4.5 / 5 = **0.90**
- Location_Score (same zone) = **1.0**
- Preference_Score = 5 / 6 = **0.833**
- `recommendation_score = (0.4 × 0.90) + (0.3 × 1.0) + (0.3 × 0.833) = 0.36 + 0.30 + 0.250 = 0.91`

**Candidate Listing B** — a Printing listing, owner `avg_rating = 5.0`, location zone = `north` (adjacent):
- Rating_Score = 5.0 / 5 = **1.0**
- Location_Score (adjacent zone) = **0.5**
- Preference_Score = 1 / 6 = **0.167**
- `recommendation_score = (0.4 × 1.0) + (0.3 × 0.5) + (0.3 × 0.167) = 0.40 + 0.15 + 0.050 = 0.60`

**Result:** Listing A (0.91) ranks above Listing B (0.60) — the student sees the highly-rated, conveniently-located, personally-relevant tutoring listing first, even though Listing B's provider has a marginally higher raw rating, because Listing A wins decisively on location and personal relevance.

## 11.7 Implementation Approach (Pseudocode)

```python
# apps/recommendations/services.py

RATING_WEIGHT = 0.4
LOCATION_WEIGHT = 0.3
PREFERENCE_WEIGHT = 0.3

ADJACENT_ZONES = {
    "central": {"north", "south"},
    "north": {"central"},
    "south": {"central"},
}

def get_recommendations(user, page=1, page_size=20):
    candidates = Listing.objects.filter(status="active").exclude(owner=user).select_related(
        "owner", "category", "campus_location"
    )

    user_zone = user.campus_location.zone if user.campus_location else None
    interaction_counts = _get_user_category_interaction_counts(user)  # {category_id: count}
    total_interactions = sum(interaction_counts.values())
    total_categories = Category.objects.filter(is_active=True).count()

    scored = []
    for listing in candidates:
        rating_score = _rating_score(listing.owner.avg_rating)
        location_score = _location_score(user_zone, listing.campus_location.zone)
        preference_score = _preference_score(
            interaction_counts.get(listing.category_id, 0),
            total_interactions,
            total_categories,
        )
        score = (
            RATING_WEIGHT * rating_score
            + LOCATION_WEIGHT * location_score
            + PREFERENCE_WEIGHT * preference_score
        )
        scored.append((listing, score))

    scored.sort(key=lambda pair: pair[1], reverse=True)
    return _paginate(scored, page, page_size)


def _rating_score(avg_rating):
    return (avg_rating / 5.0) if avg_rating is not None else 0.5


def _location_score(user_zone, listing_zone):
    if user_zone is None:
        return 0.5
    if user_zone == listing_zone:
        return 1.0
    if listing_zone in ADJACENT_ZONES.get(user_zone, set()):
        return 0.5
    return 0.0


def _preference_score(category_interactions, total_interactions, total_categories):
    if total_interactions == 0:
        return 1.0 / total_categories
    return category_interactions / total_interactions
```

## 11.8 Performance Considerations

For the pilot's expected data volume (≤100 users, ≤50 active listings), scoring every active listing on every request is computationally trivial (well under the 500ms NFR target) and requires no caching. If the platform grows well beyond pilot scale, the documented extension path is: (1) cache `get_recommendations()` results per user for a short TTL (e.g., 10 minutes) using Django's cache framework, invalidated on new listing creation; (2) pre-aggregate `interaction_counts` nightly instead of computing them per-request. **Neither optimization is required for the MVP** and should not be built prematurely.

## 11.9 Why This Is Not Machine Learning (By Design)

Every component of this engine is a deterministic arithmetic formula over data already stored in PostgreSQL — no model training, no external ML library, no black-box scoring. This is a conscious, literature-backed design choice (Section 2.3 of the proposal cites Su & Khoshgoftaar, 2009, and Herlocker et al., 2004, on simpler methods outperforming complex ones at small data scale) and keeps the system fully explainable, debuggable, and buildable by two students in a 12-week timeline.

---

# SECTION 12: ADMIN PANEL

*(Consolidates ADM-01–04, MOD-01–03, AN-01–02 from Section 3 into one operational specification.)*

## 12.1 User Management

- **List/search all users** with filters for role (provider/seller/both/neither), status (active/suspended), and free-text search on name/email
- **Suspend a user**, requiring a mandatory reason, which: (a) sets `is_suspended = true`, (b) immediately blocks login (AUTH-02 error flow), (c) sets all of that user's active listings to `status = paused` automatically (so a suspended user's listings don't remain live), (d) logs the action, (e) notifies the user
- **Reactivate a user**, reversing the suspension flag (listings remain `paused` and must be manually reactivated by the returning user themselves, not auto-restored, as a safety default)
- **Verify a user** (Phase 3): awards a visible "Verified" badge after manual, offline confirmation of identity/skill — not automated in MVP

## 12.2 Content Moderation

- **Deactivate/delete any listing**, with mandatory reason, notifies the owner, logs the action
- Listings can be moderated proactively (admin browsing) or reactively (via a resolved report)
- A deactivated listing is fully reversible by an admin (status can be set back to `active`) unless the deletion reason was severe (e.g., fraud), which is a manual judgment call recorded in the notes field

## 12.3 Review Moderation

- **Delete any review**, with mandatory reason (e.g., abusive language, clearly fake), logs the action, notifies the review's original author
- Deleting a review triggers the same `recalculate_ratings()` service used elsewhere (Section 10.5), keeping aggregate ratings consistent

## 12.4 Reports Queue

- **Central queue** of all `Report` records, default sorted oldest-pending-first (so nothing sits unresolved indefinitely)
- **Filters:** status (pending/resolved/dismissed), target_type (listing/review/user)
- **Detail view** renders the reported content in-context (embedded read-only card) alongside reporter identity, stated reason, and free-text description
- **Resolution actions:** Dismiss / Warn / Deactivate Listing / Delete Review / Suspend User — each writes to `AdminActionLog` and notifies the original reporter of the outcome, closing the feedback loop

## 12.5 Analytics

- **Overview dashboard:** total users, new users this week, total active listings, listings-by-category breakdown, total messages sent, total reviews submitted, platform-wide average rating
- **Engagement report:** date-range-filterable breakdown of daily active users, searches performed, messages sent, reviews submitted — exportable as CSV for inclusion in the final project report/defense
- All analytics queries are read-only aggregations over existing tables; no separate analytics database or event-tracking pipeline is needed at pilot scale

## 12.6 Accountability

Every state-changing admin action (suspend, reactivate, deactivate listing, delete listing, delete review, resolve report, verify user) is written to the immutable `admin_action_logs` table (Section 6.14), which is never editable through the API — only insertable — providing a permanent audit trail for the two-person admin team.

---

# SECTION 13: TESTING PLAN

## 13.1 Unit Tests

**Framework:** `pytest` + `pytest-django`

| Area | What Is Tested |
|---|---|
| `users` models/serializers | Password hashing, email uniqueness validation, phone format validation, role-flag defaults |
| `listings` models/services | `create_listing()` role-flag enforcement, price/stock validation, slug generation and uniqueness, status transitions |
| `reviews` services | `submit_review()` prior-conversation requirement, one-review-per-listing uniqueness, self-review rejection, `recalculate_ratings()` correctness (verified with known input/output fixtures, e.g., 3 reviews of 5/4/3 stars → avg 4.0) |
| `recommendations` services | `_rating_score()`, `_location_score()`, `_preference_score()` pure functions tested in isolation with edge-case inputs (null rating, null location, zero interactions) against the worked example in Section 11.6 |
| `messaging` models | Conversation dedup logic (same seeker + same listing does not create a duplicate) |
| `moderation` services | `resolve_report()` correctly links to and triggers the linked admin action, and notifies the reporter |
| Permission classes | Each custom permission class tested against authorized/unauthorized/anonymous requests |

**Target:** ≥ 80% code coverage on `services.py` and `models.py` files across all apps, measured with `pytest-cov`.

## 13.2 Integration Tests

**Framework:** `pytest-django` using DRF's `APIClient`

| Flow Tested | Scenario |
|---|---|
| Full registration → login → token refresh | End-to-end auth lifecycle including expired-token refresh |
| Create listing → appears in search → appears in category page | Confirms indexing/filtering consistency across endpoints |
| Start conversation → send message → mark read → unread count updates | Confirms the full messaging read/unread lifecycle |
| Submit review without prior conversation → rejected; with prior conversation → accepted → rating recalculated | Confirms the trust-gating business rule end-to-end |
| Report a listing → admin resolves with "deactivate" → listing becomes inactive → reporter notified | Confirms the full moderation loop across 3 apps (moderation, listings, notifications) |
| Recommendation endpoint returns listings ordered by descending score for a seeded user history | Confirms the scoring algorithm is wired correctly end-to-end, not just unit-correct in isolation |

## 13.3 User Acceptance Testing (UAT)

*(As specified in the approved proposal, Phase 4.)*

- **Participants:** 15–20 real Victoria University students (pilot group)
- **Method:** Participants use the deployed platform for a minimum of 3 days performing realistic tasks (register, browse, search, message a provider, leave a review)
- **Instrument:** The 10-item adapted System Usability Scale questionnaire (see the proposal's Appendix, Instrument 2), plus 3 open-ended questions (what they liked, what frustrated them, one feature to add/change)
- **Quantitative analysis:** Mean SUS score, standard deviation, item-level percentages, computed in Excel/Google Sheets; **target ≥ 70/100**
- **Qualitative analysis:** Thematic coding of open-ended responses to surface recurring friction points before final submission
- **Usage log verification:** Cross-reference self-reported ease-of-use against actual platform logs (search count, messages sent, reviews submitted per participant) to confirm reported behaviour matches actual usage

## 13.4 Manual/Exploratory Testing Checklist (Pre-Deployment)

- [ ] Mobile responsiveness verified on at least one real Android and one real iOS device (not just browser dev-tools emulation)
- [ ] All form validation error states manually triggered and confirmed to show clear messages
- [ ] Image upload tested with oversized files, wrong file types, and the 5-image limit
- [ ] Suspended-user login blocked and shows the correct message
- [ ] Self-review and self-messaging blocked
- [ ] Admin-only routes return 403 (not a broken page) when a non-admin manually navigates to them
- [ ] Empty states checked for every list screen (zero listings, zero messages, zero reviews, zero notifications)

---

# SECTION 14: DEVELOPMENT ROADMAP

> Mapped directly onto the approved proposal's 12-week, 5-phase Agile schedule (May–July 2026). Phase groupings below organize features by priority/dependency rather than by calendar week; Section 15 gives the literal week-by-week build sequence.

## 14.1 Phase 1 — MVP (Must-Have, Blocking)

*Nothing else works without these. Corresponds to proposal Sprint 1 + half of Sprint 2.*

1. Database schema + migrations for `users`, `campus_locations`, `categories` (with 6 seeded categories), `listings`, `listing_images`
2. `AUTH-01` Registration, `AUTH-02` Login, `AUTH-03` Token refresh, `AUTH-04` Logout
3. `PROF-01/02/03` View/edit own and public profile
4. `PROF-04` Provider/Seller role toggle
5. `LIST-01/02/03/04/05/06/07` Full listing CRUD + image upload
6. `CAT-01/02` Category listing and browsing
7. Basic frontend shell: routing, auth context, top nav, Landing/Register/Login/Dashboard/Listing Detail/Create Listing/My Listings screens
8. Deployment pipeline established early (Vercel + Render) even with minimal features, so the team is never blocked by deployment configuration late in the project

**Exit criteria:** A user can register, set up their profile, create a listing, and see it appear on a category page and their own listings dashboard.

## 14.2 Phase 2 — Core Features (Should-Have)

*Corresponds to proposal Sprint 2 (remainder) + Sprint 3.*

1. `SRCH-01/02/03/04` Keyword search, filtering, sorting
2. `MSG-01/02/03/04/05` Full messaging system
3. `RATE-01/02` and `REV-01/02/03/04` Ratings and reviews, including the prior-conversation trust gate
4. `NOTIF-01/02/03` Notifications for new messages and new reviews
5. Frontend: Search Results, Category filter sidebar, Messages/Inbox, Conversation Thread, Notifications Feed, review submission modal

**Exit criteria:** A user can search for a service, message the provider, and after the conversation exists, leave a review that updates the provider's visible aggregate rating.

## 14.3 Phase 3 — Advanced Features (Nice-to-Have / Differentiators)

*Corresponds to proposal Sprint 4 + Phase 4/5 (testing and deployment polish).*

1. `REC-01/02` Recommendation engine (Section 11) and personalized homepage feed
2. `ADM-01/02/03/04` Admin user/listing management
3. `MOD-01/02/03` User-facing reporting + admin moderation queue
4. `AN-01/02` Admin analytics dashboard + engagement export
5. Frontend: Admin Dashboard (Overview, Users, Reports, Analytics), "Recommended for You" section on the Home Dashboard
6. **Explicitly deferred beyond this project's scope** (documented, not silently dropped): online payments, native mobile app, GPS-based tracking, machine-learning-based recommendations, Favorites/wishlist (listed in the schema as Phase 3-optional but not required for defense), provider verification badges, review replies

**Exit criteria:** The full platform — including its differentiating recommendation engine and admin moderation tooling — is live, deployed, and ready for UAT and final defense.

## 14.4 Priority Rationale

Features are ordered so that **every phase produces a demonstrable, working increment** rather than a pile of half-finished parts — directly supporting the proposal's Agile justification (time-boxed, incremental, low risk of last-minute failure). If time runs short in Week 8 (per the proposal's own anticipated-limitations section), Phase 3 items are the first to be trimmed, in this order of expendability: Analytics export → Admin verification badges → Moderation queue polish (keep the core deactivate/suspend actions, simplify the UI) → Recommendation engine (kept last to cut, since it is the project's core differentiator and a supervisor/examiner talking point).

---

# SECTION 15: LOVABLE / CLAUDE CODE BUILD PLAN

> This section is written as direct, sequential instructions for an AI coding agent. Follow the steps in order. Every model, field, endpoint, and screen name below is identical to the names used in Sections 6–10, so there is no ambiguity to resolve — implement exactly what is specified there.

## STEP 0 — Environment Setup

```bash
# Backend
mkdir campus_marketplace_backend && cd campus_marketplace_backend
python -m venv venv && source venv/bin/activate
pip install django djangorestframework djangorestframework-simplejwt \
            django-cors-headers django-filter Pillow psycopg2-binary \
            python-decouple whitenoise gunicorn pytest-django pytest-cov
django-admin startproject config .
python manage.py startapp core apps/core
python manage.py startapp users apps/users
python manage.py startapp locations apps/locations
python manage.py startapp categories apps/categories
python manage.py startapp listings apps/listings
python manage.py startapp messaging apps/messaging
python manage.py startapp reviews apps/reviews
python manage.py startapp recommendations apps/recommendations
python manage.py startapp notifications apps/notifications
python manage.py startapp moderation apps/moderation

# Frontend
npm create vite@latest campus_marketplace_frontend -- --template react
cd campus_marketplace_frontend
npm install
npm install react-router-dom axios @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install lucide-react   # icon set
```

Reorganize the Django apps into the `apps/` folder structure specified in Section 10.1 (Django's `startapp` creates them at root by default — move them and update `INSTALLED_APPS` paths to `apps.users`, `apps.listings`, etc.). Configure `config/settings/base.py`, `development.py`, `production.py` per Section 10.6.

## STEP 1 — Backend: Core & Users App

1. Implement `apps/core/pagination.py` — a standard `PageNumberPagination` subclass, `page_size=20`
2. Implement `apps/core/exceptions.py` — custom DRF exception handler producing the `{ "detail": ..., "errors": {...} }` envelope from Section 7
3. Implement `apps/core/permissions.py` — `IsAdminUser`, base object-level permission helpers
4. In `apps/users/models.py`: implement the custom `User` model exactly per Section 6.1 (all fields listed), using `AbstractBaseUser` + `PermissionsMixin`, `email` as `USERNAME_FIELD`
5. In `apps/users/managers.py`: implement a `UserManager` with `create_user()` and `create_superuser()` methods that hash passwords correctly
6. Set `AUTH_USER_MODEL = 'users.User'` in `config/settings/base.py` **before the first migration is ever run** (this cannot be changed later without pain — do this first)
7. In `apps/locations/models.py`: implement `CampusLocation` per Section 6.2
8. Run `makemigrations` and `migrate`; write a data migration or management command seeding the 4 campus locations from Section 6.2
9. In `apps/users/serializers.py`: `RegisterSerializer`, `LoginSerializer`, `UserProfileSerializer` (public subset per PROF-02), `UserProfileUpdateSerializer`, `RoleToggleSerializer`
10. In `apps/users/views.py`: implement `POST /auth/register/`, `POST /auth/login/` (using SimpleJWT's `TokenObtainPairView` subclassed to also return the user object), `POST /auth/refresh/`, `POST /auth/logout/` (blacklist the refresh token), `GET /auth/me/`, `PATCH /users/me/`, `PATCH /users/me/roles/`, `POST /users/me/deactivate/`, `GET /users/{id}/`
11. Wire `apps/users/urls.py` and include it in `config/urls.py` under `/api/v1/`
12. Write unit tests per Section 13.1 for this app before moving on

## STEP 2 — Backend: Categories App

1. In `apps/categories/models.py`: implement `Category` per Section 6.3
2. Seed the 6 starter categories via a data migration or management command exactly as listed in Section 6.3
3. Implement public `GET /categories/` and admin `POST/PATCH /admin/categories/` endpoints
4. Write unit tests

## STEP 3 — Backend: Listings App

1. In `apps/listings/models.py`: implement `Listing` and `ListingImage` per Sections 6.4–6.5, plus `SearchLog` and `ListingView` per Sections 6.9–6.10 (these live in this app, not a separate one)
2. In `apps/listings/services.py`: implement `create_listing()`, `increment_view_count()`, `search_listings()` per Section 10.5
3. In `apps/listings/permissions.py`: implement `IsOwnerOrReadOnly` and `IsProviderOrSeller`
4. Implement all Listing endpoints from Section 7.4: list, search, detail, create, update, delete, status toggle, mine, image upload/delete
5. Use `django-filter` `FilterSet` for `category_id, min_price, max_price, campus_location_id, min_rating` query params
6. Every valid `GET /listings/search/` call must write a `SearchLog` row (if authenticated); every valid `GET /listings/{id}/` call must write a `ListingView` row (if authenticated) — these feed Section 11 later, do not skip this
7. Write unit and integration tests per Section 13.1–13.2

## STEP 4 — Backend: Messaging App

1. In `apps/messaging/models.py`: implement `Conversation` and `Message` per Sections 6.6–6.7, including the `UNIQUE(listing_id, initiator_id, recipient_id)` constraint
2. In `apps/messaging/permissions.py`: implement `IsConversationParticipant`
3. Implement all endpoints from Section 7.5: create conversation (with dedup check), list conversations, list/send messages, mark-read
4. Wire `notifications/services.py`'s `notify()` call on every new message sent (build the `notifications` app's `notify()` function first if not yet built — see Step 7 — or stub it temporarily and wire fully once Step 7 is done)
5. Write unit and integration tests

## STEP 5 — Backend: Reviews App

1. In `apps/reviews/models.py`: implement `Review` per Section 6.8, including both unique and check constraints
2. In `apps/reviews/services.py`: implement `submit_review()` (checks for an existing `Conversation` between reviewer and listing owner before allowing the review) and `recalculate_ratings()` exactly per Section 10.5 and the worked logic in Section 3.7 RATE-02
3. Implement all endpoints from Section 7.6
4. Write unit tests specifically verifying the aggregate-rating math against known fixture data (e.g., 3 reviews of 5/4/3 → 4.0 average)

## STEP 6 — Backend: Recommendations App

1. In `apps/recommendations/services.py`: implement the **exact** pseudocode from Section 11.7 (`get_recommendations`, `_rating_score`, `_location_score`, `_preference_score`, the `ADJACENT_ZONES` map, and the weight constants)
2. Implement `GET /recommendations/` per Section 7.7
3. Write unit tests reproducing the worked example in Section 11.6 exactly (Listing A should score 0.91, Listing B should score 0.60, given the specified inputs) — if your implementation doesn't reproduce these numbers, there is a bug, fix it before proceeding

## STEP 7 — Backend: Notifications App

1. In `apps/notifications/models.py`: implement `Notification` per Section 6.13
2. In `apps/notifications/services.py`: implement the single `notify()` entry point per Section 10.5
3. Implement endpoints from Section 7.8
4. **Go back and wire `notify()` calls into**: `messaging` (new message), `reviews` (new review received), `moderation` (report resolved, admin action taken) — if these were stubbed in earlier steps, complete the wiring now

## STEP 8 — Backend: Moderation App

1. In `apps/moderation/models.py`: implement `Report` and `AdminActionLog` per Sections 6.12 and 6.14
2. In `apps/moderation/permissions.py`: reuse/extend `IsAdminUser`
3. In `apps/moderation/services.py`: implement `resolve_report()` per Section 10.5, which must call the relevant action (suspend user / deactivate listing / delete review) AND write to `AdminActionLog` AND call `notify()` on the original reporter, all inside one transaction
4. Implement all endpoints from Section 7.9 (user-facing `POST /reports/`) and Section 7.10 (all `/admin/*` endpoints, including analytics aggregation queries)
5. Write unit and integration tests, especially for the full report → resolve → notify loop (Section 13.2)

## STEP 9 — Backend: Final Checks Before Frontend

- [ ] Every endpoint in Section 7 exists and returns the documented shape
- [ ] Every endpoint enforces the correct auth/permission per Section 7 and Section 10.4
- [ ] CORS is configured to allow the (not-yet-deployed) Vercel frontend origin, plus `localhost:5173` for local dev
- [ ] Run the full test suite; fix any failures before starting frontend work

## STEP 10 — Frontend: Project Setup & Design System

1. Configure `tailwind.config.js` with the exact color tokens, font family (`Inter`), and spacing scale from Section 9.1
2. Set up `react-router-dom` with the full route map from Section 8.1
3. Build an `AuthContext` (or use React Query + a small context) storing the current user and JWT tokens; implement the Axios interceptor for automatic token attachment and silent refresh (Section 8, top)
4. Build shared components first, reused everywhere: `Button` (primary/secondary/danger variants), `Input`, `Card` (ListingCard), `Badge`, `StarRating`, `Modal`, `Toast`, `TopNav`, `BottomTabBar` (mobile) — all per the exact specs in Section 9.1.4

## STEP 11 — Frontend: Auth & Onboarding Screens

1. Build `/register`, `/login`, `/onboarding` exactly per Sections 8.3–8.5 and the visual detail in Section 9.2
2. Wire to `POST /auth/register/`, `POST /auth/login/`, `PATCH /users/me/`, `PATCH /users/me/roles/`
3. Implement the full Registration and Login flows including every alternative/error path from Sections 5.1–5.2

## STEP 12 — Frontend: Dashboard, Profile, Listings

1. Build `/dashboard` per Section 8.6 and 9.2 (category tiles, recommended section placeholder — wire to real data once Step 14 is done, static/empty state is fine for now)
2. Build `/profile/me`, `/profile/:id` per Section 8.7–8.8
3. Build `/listings/new`, `/listings/:id`, `/listings/:id/edit`, `/my-listings` per Sections 8.9–8.11 and the Create/Edit form detail in Section 9.2
4. Implement the full Create Listing flow including every alternative/error path from Section 5.3

## STEP 13 — Frontend: Search & Categories

1. Build `/categories`, `/categories/:slug`, `/search` per Sections 8.12–8.13 and 9.2
2. Implement the filter sidebar/drawer, sort dropdown, and paginated result grid
3. Implement the full Searching flow including alternative/error paths from Section 5.4

## STEP 14 — Frontend: Messaging & Reviews

1. Build `/messages`, `/messages/:conversationId` per Sections 8.14–8.15 and 9.2
2. Implement the full Contacting a Provider flow (Section 5.5) and Leaving a Review flow (Section 5.6), including the review submission modal
3. Go back to `/listings/:id` and wire the real "Message Provider" button and "Leave a Review" button/eligibility logic now that both APIs exist

## STEP 15 — Frontend: Recommendations & Notifications

1. Go back to `/dashboard` and wire the real "Recommended for You" section to `GET /recommendations/`
2. Build `/notifications` per Section 8.16
3. Add unread badges to the TopNav (Messages icon, Notifications icon), polled or fetched on relevant navigation events

## STEP 16 — Frontend: Admin Dashboard

1. Build `/admin-dashboard`, `/admin-dashboard/users`, `/admin-dashboard/reports`, `/admin-dashboard/analytics` per Sections 8.17–8.20 and 9.2
2. Guard all admin routes client-side (redirect non-admins) in addition to the server-side `is_admin` enforcement already in place
3. Implement the full Admin Moderation flow (Section 5.8)

## STEP 17 — Testing Pass

1. Run the full backend automated test suite (Section 13.1–13.2) — all green before proceeding
2. Walk the manual/exploratory checklist (Section 13.4) end-to-end
3. Recruit the 15–20 pilot testers and run UAT (Section 13.3)

## STEP 18 — Deployment

**Backend (Render):**
1. Create a new Render Web Service, connect the backend repo
2. Set environment variables: `DATABASE_URL` (Render-provisioned PostgreSQL), `SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` (the Vercel frontend URL)
3. Build command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
4. Start command: `gunicorn config.wsgi:application`
5. Run the seed data management commands (categories, campus locations) once against production via Render's shell

**Frontend (Vercel):**
1. Connect the frontend repo to a new Vercel project
2. Set environment variable `VITE_API_BASE_URL` pointing to the Render backend's public URL
3. Build command: `npm run build`; output directory: `dist`
4. Configure a custom domain if the 100,000 UGX domain budget line item has been purchased; otherwise use the default Vercel subdomain

**Post-deployment:**
1. Smoke-test every route in Section 8.1 against the live URLs
2. Confirm CORS works end-to-end (register/login from the live frontend against the live backend)
3. Confirm image uploads work in production (check storage configuration — for a pilot, local filesystem storage on Render's persistent disk is acceptable; document this as a known scaling limitation if the platform grows beyond pilot size)

## 15.1 Build Order Summary (Quick Reference)

```
Backend:  Core/Users → Locations/Categories → Listings → Messaging
          → Reviews → Recommendations → Notifications → Moderation
          → Tests → Deploy

Frontend: Setup/Design System → Auth/Onboarding → Dashboard/Profile/Listings
          → Search/Categories → Messaging/Reviews → Recommendations/Notifications
          → Admin Dashboard → Tests → Deploy
```

This order is deliberate: every backend app is fully built and tested before the frontend screen that depends on it is wired up, so an AI coding agent (or a human developer) is never blocked waiting on an API that doesn't exist yet.
