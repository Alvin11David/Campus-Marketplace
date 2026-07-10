const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? "http://localhost:8080";
export const API_BASE = `${API_ORIGIN}/api/v1`;

function extractError(body: Record<string, unknown>): string {
  if (body.errors && typeof body.errors === "object") {
    const fieldMsgs = Object.entries(body.errors as Record<string, string[]>)
      .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
      .join("; ");
    if (fieldMsgs) return `${body.detail ?? "Validation failed"} (${fieldMsgs})`;
  }
  return (body.detail as string) || "Request failed";
}

async function refreshToken(): Promise<string | null> {
  const rt = localStorage.getItem("cm_refresh_token");
  if (!rt) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const newToken: string = data.accessToken ?? data.token;
    localStorage.setItem("cm_token", newToken);
    return newToken;
  } catch {
    return null;
  }
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
  if (res.status === 401) {
    const newToken = await refreshToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      if (retry.ok) return retry.json();
    }
  }
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

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>("DELETE", path);
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
  status: string;
  condition: string;
  location_details: string | null;
  view_count: number;
  message_count: number;
  primary_image_url: string | null;
  currency: string;
  stock_quantity: number | null;
  owner: ListingOwner;
  images: ListingImage[];
  avg_rating: number | null;
  category_id: number;
  category_name: string;
  category: { id: number; name: string };
  campus_location_id: number;
  campus_location_name: string;
  campus_location: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export function mapListing(data: any): Listing {
  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    description: data.description ?? "",
    price: Number(data.price),
    price_unit: "flat",
    listing_type: data.listingType,
    status: data.status,
    condition: "not-applicable",
    location_details: null,
    view_count: data.viewCount ?? 0,
    message_count: data.messageCount ?? 0,
    primary_image_url: data.primaryImageUrl ?? null,
    currency: data.currency ?? "UGX",
    stock_quantity: data.stockQuantity ?? null,
    avg_rating: data.avgRating ?? null,
    owner: {
      id: data.owner.id,
      full_name: data.owner.fullName,
      profile_photo_url: data.owner.profilePhotoUrl ?? null,
      avg_rating: data.owner.avgRating ?? null,
      rating_count: data.owner.ratingCount ?? 0,
      is_verified: false,
    },
    images: (data.images ?? []).map((img: any) => ({
      id: img.id,
      image_url: img.imageUrl,
      sort_order: img.sortOrder,
    })),
    category_id: data.category.id,
    category_name: data.category.name,
    category: { id: data.category.id, name: data.category.name },
    campus_location_id: data.campusLocation.id,
    campus_location_name: data.campusLocation.name,
    campus_location: { id: data.campusLocation.id, name: data.campusLocation.name },
    created_at: data.createdAt,
    updated_at: data.createdAt,
  };
}

export function mapCategory(data: any): Category {
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    listing_type_hint: data.listingTypeHint ?? "both",
    icon_name: data.iconName ?? "Package",
    description: data.description ?? null,
    is_active: data.active ?? true,
    active_listing_count: 0,
  };
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
  notif_type: string;
  title: string;
  body: string;
  is_read: boolean;
  related_type: string | null;
  related_id: number | null;
  created_at: string;
}

export function mapNotification(data: any): Notification {
  return {
    id: data.id,
    notif_type: data.notifType,
    title: data.title,
    body: data.body ?? "",
    is_read: data.isRead ?? false,
    related_type: data.relatedType ?? null,
    related_id: data.relatedId ?? null,
    created_at: data.createdAt,
  };
}

export interface Review {
  id: number;
  listing_id: number;
  rating: number;
  comment: string;
  reviewer: {
    id: number;
    full_name: string;
    profile_photo_url: string | null;
  };
  created_at: string;
}

export function mapReview(data: any): Review {
  return {
    id: data.id,
    listing_id: data.listingId,
    rating: data.rating,
    comment: data.comment ?? "",
    reviewer: {
      id: data.reviewer.id,
      full_name: data.reviewer.fullName,
      profile_photo_url: data.reviewer.profilePhotoUrl ?? null,
    },
    created_at: data.createdAt,
  };
}

export interface Report {
  id: number;
  reason: string;
  description: string;
  status: string;
  reporter: { id: number; full_name: string };
  target_type: string;
  target_id: number;
  created_at: string;
}

export function mapReport(data: any): Report {
  return {
    id: data.id,
    reason: data.reason,
    description: data.description ?? "",
    status: data.status,
    reporter: {
      id: data.reporter.id,
      full_name: data.reporter.fullName ?? data.reporter.full_name,
    },
    target_type: data.targetType,
    target_id: data.targetId,
    created_at: data.createdAt,
  };
}

export interface CampusLocation {
  id: number;
  name: string;
  zone: string;
}

export async function fetchLocations(): Promise<CampusLocation[]> {
  try {
    const res = await fetch(`${API_BASE}/locations`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [];

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
