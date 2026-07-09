const API_BASE = "http://localhost:8080/api/v1";

function extractError(body: Record<string, unknown>): string {
  if (body.errors && typeof body.errors === "object") {
    const fieldMsgs = Object.entries(body.errors as Record<string, string[]>)
      .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
      .join("; ");
    if (fieldMsgs) return `${body.detail ?? "Validation failed"} (${fieldMsgs})`;
  }
  return (body.detail as string) || "Request failed";
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("cm_token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    let err: Record<string, unknown>;
    try { err = JSON.parse(text); } catch { err = { detail: text || "Request failed" }; }
    console.error("API error:", res.status, err);
    throw new Error(extractError(err));
  }
  return res.json();
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
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
  description: string;
  price: number;
  price_unit: "flat" | "hourly" | "negotiable";
  listing_type: "service" | "product";
  status: "active" | "sold" | "closed";
  condition: "new" | "like-new" | "good" | "fair" | "not-applicable";
  location_details: string | null;
  view_count: number;
  owner: ListingOwner;
  images: ListingImage[];
  category_id: number;
  category_name: string;
  campus_location_id: number;
  campus_location_name: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: number;
  listing_id: number | null;
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

export function mapConversation(data: any): Conversation {
  return {
    id: data.id,
    listing_id: data.listing?.id ?? null,
    listing_title: data.listing?.title ?? "",
    listing_image_url: null,
    other_participant: {
      id: data.otherParticipant.id,
      full_name: data.otherParticipant.fullName,
      profile_photo_url: data.otherParticipant.profilePhotoUrl ?? null,
    },
    last_message_preview: data.lastMessagePreview ?? "",
    last_message_at: data.lastMessageAt,
    unread_count: data.unreadCount,
    created_at: data.createdAt,
  };
}

export function mapMessage(data: any): Message {
  return {
    id: data.id,
    conversation_id: data.conversationId ?? 0,
    sender_id: data.senderId,
    body: data.content,
    is_read: data.isRead ?? false,
    created_at: data.createdAt,
  };
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_listing_id: number | null;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  reviewer: {
    id: number;
    full_name: string;
    profile_photo_url: string | null;
  };
  created_at: string;
}

export interface Report {
  id: number;
  reason: string;
  description: string;
  status: string;
  reporter: { id: number; full_name: string };
  target_user: { id: number; full_name: string } | null;
  target_listing: { id: number; title: string } | null;
  created_at: string;
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
