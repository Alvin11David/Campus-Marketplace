const API_BASE = "http://localhost:8080/api/v1";

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  bio: string | null;
  profile_photo_url: string | null;
  campus_location_id: number | null;
  campus_location_name: string | null;
  is_provider: boolean;
  is_seller: boolean;
  is_admin: boolean;
  is_verified: boolean;
  is_active: boolean;
  is_suspended: boolean;
  avg_rating: number | null;
  rating_count: number;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  listing_type_hint: "service" | "product" | "both";
  icon_name: string;
  description: string | null;
  is_active: boolean;
  active_listing_count: number;
}

export interface ListingImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface ListingOwner {
  id: number;
  full_name: string;
  profile_photo_url: string | null;
  avg_rating: number | null;
  rating_count: number;
  is_verified?: boolean;
}

export interface Listing {
  id: number;
  title: string;
  slug: string;
  listing_type: "service" | "product";
  category: { id: number; name: string };
  price: string;
  currency: string;
  description: string;
  campus_location: { id: number; name: string };
  campus_location_id: number;
  owner: ListingOwner;
  owner_id: number;
  primary_image_url: string | null;
  images: ListingImage[];
  stock_quantity: number | null;
  status: "active" | "paused" | "draft" | "deleted";
  avg_rating: number | null;
  rating_count: number;
  view_count: number;
  message_count: number;
  recommendation_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  listing_id: number;
  listing_title: string;
  listing_image_url: string | null;
  other_participant: {
    id: number;
    full_name: string;
    profile_photo_url: string | null;
  };
  last_message_preview: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  listing_id: number;
  reviewer: {
    id: number;
    full_name: string;
    profile_photo_url: string | null;
  };
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  notif_type: string;
  title: string;
  body: string | null;
  related_type: string | null;
  related_id: number | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: number;
  reporter_id: number;
  target_type: "listing" | "review" | "user";
  target_id: number;
  reason: string;
  description: string | null;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

export interface AdminAnalytics {
  total_users: number;
  new_users_this_week: number;
  total_active_listings: number;
  listings_by_category: { category: string; count: number }[];
  total_messages_sent: number;
  total_reviews_submitted: number;
  platform_avg_rating: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const CAMPUS_LOCATIONS = [
  { id: 1, name: "Main Campus", zone: "central" },
  { id: 2, name: "Annex", zone: "north" },
  { id: 3, name: "Hostel Area A", zone: "south" },
  { id: 4, name: "Hostel Area B", zone: "south" },
];

export const CATEGORY_ICONS: Record<string, string> = {
  "Printing & Photocopying": "Printer",
  "Device Repair": "Wrench",
  Tutoring: "BookOpen",
  "Hair & Beauty": "Scissors",
  "Laundry & Event Planning": "Sparkles",
  "Campus Products": "Package",
};

export const MOCK_USER: User = {
  id: 1,
  full_name: "Richard Seko Anundu",
  email: "richard@students.vu.ac.ug",
  phone: "+256700000000",
  bio: "Computer Science student & tech enthusiast. I offer laptop repair and tutoring services.",
  profile_photo_url: null,
  campus_location_id: 1,
  campus_location_name: "Main Campus",
  is_provider: true,
  is_seller: true,
  is_admin: true,
  is_verified: true,
  is_active: true,
  is_suspended: false,
  avg_rating: 4.7,
  rating_count: 12,
  created_at: "2026-05-01T08:00:00Z",
};
