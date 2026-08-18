import type { Listing, Conversation, Message, Review, Notification, Report, AdminAnalytics, Category } from "./api";

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Printing & Photocopying", slug: "printing-photocopying", listing_type_hint: "service", icon_name: "Printer", description: "Printing, photocopying, and binding services", is_active: true, active_listing_count: 4 },
  { id: 2, name: "Device Repair", slug: "device-repair", listing_type_hint: "service", icon_name: "Wrench", description: "Laptop, phone, and gadget repair", is_active: true, active_listing_count: 6 },
  { id: 3, name: "Tutoring", slug: "tutoring", listing_type_hint: "service", icon_name: "BookOpen", description: "Academic tutoring and study groups", is_active: true, active_listing_count: 5 },
  { id: 4, name: "Hair & Beauty", slug: "hair-beauty", listing_type_hint: "both", icon_name: "Scissors", description: "Hair styling, braids, and beauty services", is_active: true, active_listing_count: 3 },
  { id: 5, name: "Laundry & Event Planning", slug: "laundry-event-planning", listing_type_hint: "service", icon_name: "Sparkles", description: "Laundry services and event planning", is_active: true, active_listing_count: 2 },
  { id: 6, name: "Campus Products", slug: "campus-products", listing_type_hint: "product", icon_name: "Package", description: "Snacks, beauty items, textbooks, and more", is_active: true, active_listing_count: 7 },
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 1, title: "Laptop Screen & Battery Repair", slug: "laptop-screen-battery-repair", listing_type: "service",
    category: { id: 2, name: "Device Repair" }, price: "25000.00", currency: "UGX",
    description: "I fix cracked laptop screens and replace faulty batteries for all major brands (Dell, HP, Lenovo, MacBook). I've been repairing devices for 2 years and use quality replacement parts. Turnaround: 24-48 hours. Free diagnostic check.",
    campus_location: { id: 1, name: "Main Campus" }, campus_location_id: 1,
    owner: { id: 2, full_name: "Taban James", profile_photo_url: null, avg_rating: 4.8, rating_count: 9, is_verified: true },
    owner_id: 2, primary_image_url: null, images: [], stock_quantity: null,
    status: "active", avg_rating: 4.8, rating_count: 6, view_count: 142, message_count: 18,
    created_at: "2026-05-15T10:00:00Z", updated_at: "2026-06-20T14:00:00Z",
  },
  {
    id: 2, title: "Discrete Mathematics Tutoring (Year 1-2)", slug: "discrete-math-tutoring", listing_type: "service",
    category: { id: 3, name: "Tutoring" }, price: "15000.00", currency: "UGX",
    description: "Struggling with Discrete Math? I offer one-on-one and small group tutoring sessions. Covered topics: set theory, logic, combinatorics, graph theory, and Boolean algebra. I scored an A in this course and have tutored 10+ students.",
    campus_location: { id: 1, name: "Main Campus" }, campus_location_id: 1,
    owner: { id: 1, full_name: "Richard Seko Anundu", profile_photo_url: null, avg_rating: 4.7, rating_count: 12, is_verified: true },
    owner_id: 1, primary_image_url: null, images: [], stock_quantity: null,
    status: "active", avg_rating: 4.5, rating_count: 4, view_count: 89, message_count: 7,
    created_at: "2026-05-20T09:00:00Z", updated_at: "2026-06-18T11:00:00Z",
  },
  {
    id: 3, title: "Professional Printing & Binding", slug: "professional-printing-binding", listing_type: "service",
    category: { id: 1, name: "Printing & Photocopying" }, price: "500.00", currency: "UGX",
    description: "High-quality printing services at competitive prices. Black & white: 500 UGX/page, Color: 1000 UGX/page. Binding services available (spiral, thermal). Bulk discounts for group submissions.",
    campus_location: { id: 1, name: "Main Campus" }, campus_location_id: 1,
    owner: { id: 3, full_name: "Sarah Nakato", profile_photo_url: null, avg_rating: 4.5, rating_count: 8, is_verified: true },
    owner_id: 3, primary_image_url: null, images: [], stock_quantity: null,
    status: "active", avg_rating: 4.3, rating_count: 5, view_count: 210, message_count: 25,
    created_at: "2026-05-10T08:00:00Z", updated_at: "2026-06-22T16:00:00Z",
  },
  {
    id: 4, title: "Braiding & Weaves (All Styles)", slug: "braiding-weaves", listing_type: "service",
    category: { id: 4, name: "Hair & Beauty" }, price: "35000.00", currency: "UGX",
    description: "Professional braiding and weave installation. Styles: box braids, cornrows, twists, knotless braids. I use high-quality hair extensions. Free consultation before appointment.",
    campus_location: { id: 2, name: "Market Plaza" }, campus_location_id: 2,
    owner: { id: 4, full_name: "Grace Achieng", profile_photo_url: null, avg_rating: 4.9, rating_count: 15, is_verified: true },
    owner_id: 4, primary_image_url: null, images: [], stock_quantity: null,
    status: "active", avg_rating: 4.9, rating_count: 10, view_count: 310, message_count: 42,
    created_at: "2026-05-01T07:00:00Z", updated_at: "2026-06-25T10:00:00Z",
  },
  {
    id: 5, title: "Second-Hand Python Textbook", slug: "second-hand-python-textbook", listing_type: "product",
    category: { id: 6, name: "Campus Products" }, price: "45000.00", currency: "UGX",
    description: "'Python Crash Course' by Eric Matthes (2nd Edition). Gently used, no markings or damage. Great for CS101 and programming fundamentals.",
    campus_location: { id: 2, name: "Market Plaza" }, campus_location_id: 2,
    owner: { id: 5, full_name: "Peter Okello", profile_photo_url: null, avg_rating: 4.2, rating_count: 6, is_verified: true },
    owner_id: 5, primary_image_url: null, images: [], stock_quantity: 1,
    status: "active", avg_rating: 4.0, rating_count: 2, view_count: 67, message_count: 4,
    created_at: "2026-06-01T12:00:00Z", updated_at: "2026-06-20T09:00:00Z",
  },
  {
    id: 6, title: "Phone Screen Protector & Phone Case", slug: "phone-screen-protector", listing_type: "product",
    category: { id: 6, name: "Campus Products" }, price: "15000.00", currency: "UGX",
    description: "Tempered glass screen protectors and silicone phone cases for Samsung and iPhone models. Various colors available.",
    campus_location: { id: 1, name: "Main Campus" }, campus_location_id: 1,
    owner: { id: 6, full_name: "Mary Wanzala", profile_photo_url: null, avg_rating: 4.4, rating_count: 7, is_verified: true },
    owner_id: 6, primary_image_url: null, images: [], stock_quantity: 15,
    status: "active", avg_rating: 4.2, rating_count: 3, view_count: 95, message_count: 8,
    created_at: "2026-06-05T10:00:00Z", updated_at: "2026-06-22T13:00:00Z",
  },
  {
    id: 7, title: "Laundry Service (Wash + Iron)", slug: "laundry-service", listing_type: "service",
    category: { id: 5, name: "Laundry & Event Planning" }, price: "8000.00", currency: "UGX",
    description: "Full laundry service: washing, drying, ironing, and folding. Pickup and delivery within Main Campus. 24-hour turnaround. Special rates for weekly subscriptions.",
    campus_location: { id: 1, name: "Main Campus" }, campus_location_id: 1,
    owner: { id: 7, full_name: "John Kato", profile_photo_url: null, avg_rating: 4.3, rating_count: 11, is_verified: true },
    owner_id: 7, primary_image_url: null, images: [], stock_quantity: null,
    status: "paused", avg_rating: 4.1, rating_count: 7, view_count: 178, message_count: 22,
    created_at: "2026-05-08T11:00:00Z", updated_at: "2026-06-24T09:00:00Z",
  },
  {
    id: 8, title: "Homemade Snacks Pack", slug: "homemade-snacks-pack", listing_type: "product",
    category: { id: 6, name: "Campus Products" }, price: "5000.00", currency: "UGX",
    description: "Fresh homemade snacks: samosas, spring rolls, and muffins. Order by 8am for same-day delivery. Weekly meal prep packages also available!",
    campus_location: { id: 2, name: "Market Plaza" }, campus_location_id: 2,
    owner: { id: 1, full_name: "Richard Seko Anundu", profile_photo_url: null, avg_rating: 4.7, rating_count: 12 },
    owner_id: 1, primary_image_url: null, images: [], stock_quantity: 25,
    status: "active", avg_rating: 5.0, rating_count: 2, view_count: 56, message_count: 9,
    created_at: "2026-06-15T09:00:00Z", updated_at: "2026-06-26T10:00:00Z",
  },
  {
    id: 9, title: "Event Planning & Decoration", slug: "event-planning-decoration", listing_type: "service",
    category: { id: 5, name: "Laundry & Event Planning" }, price: "100000.00", currency: "UGX",
    description: "Full event planning service for birthdays, graduation parties, and campus events. Package includes: venue decoration, catering coordination, and music setup.",
    campus_location: { id: 2, name: "Market Plaza" }, campus_location_id: 2,
    owner: { id: 8, full_name: "Faith Namugenyi", profile_photo_url: null, avg_rating: 4.6, rating_count: 5, is_verified: true },
    owner_id: 8, primary_image_url: null, images: [], stock_quantity: null,
    status: "active", avg_rating: 4.8, rating_count: 3, view_count: 134, message_count: 11,
    created_at: "2026-06-10T13:00:00Z", updated_at: "2026-06-25T15:00:00Z",
  },
  {
    id: 10, title: "Statistics & Research Methods Tutoring", slug: "statistics-tutoring", listing_type: "service",
    category: { id: 3, name: "Tutoring" }, price: "20000.00", currency: "UGX",
    description: "SPSS, STATA, and Excel tutoring. I help with data analysis for research projects, assignments, and dissertations. Experienced with both undergraduate and graduate-level work.",
    campus_location: { id: 1, name: "Main Campus" }, campus_location_id: 1,
    owner: { id: 9, full_name: "Dr. Sarah Mbabazi", profile_photo_url: null, avg_rating: 4.9, rating_count: 20, is_verified: true },
    owner_id: 9, primary_image_url: null, images: [], stock_quantity: null,
    status: "active", avg_rating: 4.9, rating_count: 15, view_count: 267, message_count: 31,
    created_at: "2026-05-05T08:00:00Z", updated_at: "2026-06-26T12:00:00Z",
  },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, listing_id: 1, listing_title: "Laptop Screen & Battery Repair", listing_image_url: null, other_participant: { id: 2, full_name: "Taban James", profile_photo_url: null }, last_message_preview: "Sure, bring it by tomorrow afternoon", last_message_at: "2026-06-24T14:30:00Z", unread_count: 0, created_at: "2026-06-20T10:00:00Z" },
  { id: 2, listing_id: 4, listing_title: "Braiding & Weaves (All Styles)", listing_image_url: null, other_participant: { id: 4, full_name: "Grace Achieng", profile_photo_url: null }, last_message_preview: "I can do knotless braids, let me know your preferred length", last_message_at: "2026-06-25T09:15:00Z", unread_count: 2, created_at: "2026-06-23T11:00:00Z" },
  { id: 3, listing_id: 5, listing_title: "Second-Hand Python Textbook", listing_image_url: null, other_participant: { id: 5, full_name: "Peter Okello", profile_photo_url: null }, last_message_preview: "Is the book still available?", last_message_at: "2026-06-22T16:45:00Z", unread_count: 0, created_at: "2026-06-22T16:00:00Z" },
];

export const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, conversation_id: 1, sender_id: 1, body: "Hi Taban! Is the laptop screen repair still available?", is_read: true, created_at: "2026-06-20T10:00:00Z" },
    { id: 2, conversation_id: 1, sender_id: 2, body: "Yes it is! What laptop model do you have?", is_read: true, created_at: "2026-06-20T10:05:00Z" },
    { id: 3, conversation_id: 1, sender_id: 1, body: "I have a Dell Inspiron 15. The screen is cracked but still works partially.", is_read: true, created_at: "2026-06-20T10:10:00Z" },
    { id: 4, conversation_id: 1, sender_id: 2, body: "I can replace that. It'll be 25,000 UGX for the screen replacement. Takes about 24 hours.", is_read: true, created_at: "2026-06-20T10:15:00Z" },
    { id: 5, conversation_id: 1, sender_id: 1, body: "That sounds good! When can I bring it in?", is_read: true, created_at: "2026-06-24T14:00:00Z" },
    { id: 6, conversation_id: 1, sender_id: 2, body: "Sure, bring it by tomorrow afternoon", is_read: true, created_at: "2026-06-24T14:30:00Z" },
  ],
  2: [
    { id: 7, conversation_id: 2, sender_id: 1, body: "Hi Grace! I'm interested in braiding services.", is_read: true, created_at: "2026-06-23T11:00:00Z" },
    { id: 8, conversation_id: 2, sender_id: 4, body: "Hello! What style are you looking for?", is_read: true, created_at: "2026-06-23T11:30:00Z" },
    { id: 9, conversation_id: 2, sender_id: 1, body: "I'd like knotless braids, medium length.", is_read: true, created_at: "2026-06-25T09:00:00Z" },
    { id: 10, conversation_id: 2, sender_id: 4, body: "I can do knotless braids, let me know your preferred length", is_read: false, created_at: "2026-06-25T09:15:00Z" },
    { id: 11, conversation_id: 2, sender_id: 4, body: "And I have a promotion this week - 10% off!", is_read: false, created_at: "2026-06-25T09:16:00Z" },
  ],
  3: [
    { id: 12, conversation_id: 3, sender_id: 1, body: "Hi Peter, is the Python textbook still available?", is_read: true, created_at: "2026-06-22T16:00:00Z" },
    { id: 13, conversation_id: 3, sender_id: 5, body: "Yes it is! Are you interested?", is_read: true, created_at: "2026-06-22T16:30:00Z" },
    { id: 14, conversation_id: 3, sender_id: 1, body: "Is the book still available?", is_read: true, created_at: "2026-06-22T16:45:00Z" },
  ],
};

export const MOCK_REVIEWS: Review[] = [
  { id: 1, listing_id: 1, reviewer: { id: 1, full_name: "Richard Seko Anundu", profile_photo_url: null }, rating: 5, comment: "Fixed my laptop screen perfectly. Great service!", created_at: "2026-06-01T10:00:00Z", updated_at: "2026-06-01T10:00:00Z" },
  { id: 2, listing_id: 1, reviewer: { id: 3, full_name: "Sarah Nakato", profile_photo_url: null }, rating: 5, comment: "Very professional and fast. Highly recommend!", created_at: "2026-06-05T14:00:00Z", updated_at: "2026-06-05T14:00:00Z" },
  { id: 3, listing_id: 1, reviewer: { id: 6, full_name: "Mary Wanzala", profile_photo_url: null }, rating: 4, comment: "Good work but took a bit longer than promised.", created_at: "2026-06-10T09:00:00Z", updated_at: "2026-06-10T09:00:00Z" },
  { id: 4, listing_id: 2, reviewer: { id: 5, full_name: "Peter Okello", profile_photo_url: null }, rating: 5, comment: "Richard explained complex topics clearly. Helped me pass my exam!", created_at: "2026-06-15T11:00:00Z", updated_at: "2026-06-15T11:00:00Z" },
  { id: 5, listing_id: 4, reviewer: { id: 1, full_name: "Richard Seko Anundu", profile_photo_url: null }, rating: 5, comment: "Best braiding on campus! Very affordable too.", created_at: "2026-06-20T15:00:00Z", updated_at: "2026-06-20T15:00:00Z" },
  { id: 6, listing_id: 8, reviewer: { id: 3, full_name: "Sarah Nakato", profile_photo_url: null }, rating: 5, comment: "The samosas are amazing! Fresh and affordable.", created_at: "2026-06-25T12:00:00Z", updated_at: "2026-06-25T12:00:00Z" },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, notif_type: "new_message", title: "New message from Grace", body: "I can do knotless braids, let me know your preferred length", related_type: "conversation", related_id: 2, is_read: false, created_at: "2026-06-25T09:15:00Z" },
  { id: 2, notif_type: "new_message", title: "New message from Grace", body: "And I have a promotion this week - 10% off!", related_type: "conversation", related_id: 2, is_read: false, created_at: "2026-06-25T09:16:00Z" },
  { id: 3, notif_type: "new_review", title: "New 5-star review!", body: "Sarah Nakato left a 5-star review on your listing 'Homemade Snacks Pack'", related_type: "listing", related_id: 8, is_read: true, created_at: "2026-06-25T12:00:00Z" },
  { id: 4, notif_type: "new_message", title: "New message from Taban", body: "Sure, bring it by tomorrow afternoon", related_type: "conversation", related_id: 1, is_read: true, created_at: "2026-06-24T14:30:00Z" },
];

export const MOCK_REPORTS: Report[] = [
  { id: 1, reporter_id: 3, target_type: "listing", target_id: 99, reason: "misleading", description: "Price changed after I messaged the seller", status: "pending", created_at: "2026-06-24T10:00:00Z" },
  { id: 2, reporter_id: 5, target_type: "user", target_id: 10, reason: "scam", description: "This user asked for payment upfront but never delivered", status: "pending", created_at: "2026-06-25T08:00:00Z" },
  { id: 3, reporter_id: 1, target_type: "listing", target_id: 20, reason: "inappropriate", description: "Listing contains offensive language", status: "resolved", created_at: "2026-06-22T14:00:00Z" },
];

export const MOCK_ANALYTICS: AdminAnalytics = {
  total_users: 34,
  new_users_this_week: 6,
  total_active_listings: 22,
  listings_by_category: [
    { category: "Printing & Photocopying", count: 4 },
    { category: "Device Repair", count: 6 },
    { category: "Tutoring", count: 5 },
    { category: "Hair & Beauty", count: 3 },
    { category: "Laundry & Event Planning", count: 2 },
    { category: "Campus Products", count: 7 },
  ],
  total_messages_sent: 210,
  total_reviews_submitted: 18,
  platform_avg_rating: 4.4,
  pending_reports_count: 2,
  service_product_split: { service: 12, product: 10 },
  top_providers: [
    { id: 9, full_name: "Dr. Sarah Mbabazi", profile_photo_url: null, avg_rating: 4.9, rating_count: 20, is_provider: true, is_seller: false, listing_count: 3 },
    { id: 2, full_name: "Taban James", profile_photo_url: null, avg_rating: 4.8, rating_count: 15, is_provider: true, is_seller: false, listing_count: 2 },
    { id: 4, full_name: "Grace Achieng", profile_photo_url: null, avg_rating: 4.7, rating_count: 12, is_provider: true, is_seller: false, listing_count: 2 },
    { id: 5, full_name: "Peter Okello", profile_photo_url: null, avg_rating: 4.5, rating_count: 8, is_provider: false, is_seller: true, listing_count: 4 },
    { id: 7, full_name: "Faith Nabukenya", profile_photo_url: null, avg_rating: 4.3, rating_count: 6, is_provider: true, is_seller: true, listing_count: 5 },
  ],
  recent_admin_actions: [
    { id: 1, admin_name: "Richard Seko Anundu", action: "verify_user", target_type: "user", target_id: 5, notes: "Verified as provider", created_at: "2026-07-13T10:30:00Z" },
    { id: 2, admin_name: "Richard Seko Anundu", action: "deactivate_listing", target_type: "listing", target_id: 99, notes: "Misleading pricing", created_at: "2026-07-12T14:00:00Z" },
    { id: 3, admin_name: "Richard Seko Anundu", action: "suspend_user", target_type: "user", target_id: 10, notes: "Scam report confirmed", created_at: "2026-07-11T09:00:00Z" },
    { id: 4, admin_name: "Richard Seko Anundu", action: "dismiss_report", target_type: "report", target_id: 1, notes: "No violation found", created_at: "2026-07-10T16:00:00Z" },
    { id: 5, admin_name: "Richard Seko Anundu", action: "reactivate_user", target_type: "user", target_id: 8, notes: "Appealed successfully", created_at: "2026-07-09T11:00:00Z" },
  ],
  top_search_terms: [
    { query: "laptop repair", count: 23 },
    { query: "braids", count: 18 },
    { query: "textbooks", count: 15 },
    { query: "tutoring", count: 12 },
    { query: "snacks", count: 10 },
    { query: "python", count: 8 },
    { query: "printing", count: 7 },
    { query: "hair", count: 6 },
    { query: "calculator", count: 5 },
    { query: "laundry", count: 4 },
  ],
};
