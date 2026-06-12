// Types for sync operations

export interface SyncResult {
  success: boolean;
  provider: string;
  type: "STAY" | "DINING" | "ACTIVITY" | "INTEGRATION_HEALTH";
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  errorMessage?: string;
  errorDetails?: string;
  summary: string;
  duration: number; // milliseconds
}

export interface GooglePlacesResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  photos?: Array<{
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

export interface ExternalStayData {
  externalId: string;
  name: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  priceFrom?: number;
  lat?: number;
  lng?: number;
  address?: string;
  type?: string;
  amenities?: string[];
  images?: string[];
  sourceType: string;
}

export interface ExternalDiningData {
  externalId: string;
  name: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  lat?: number;
  lng?: number;
  address?: string;
  type?: string;
  cuisineTags?: string[];
  images?: string[];
  sourceType: string;
}

export interface ExternalActivityData {
  externalId: string;
  title: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  lat?: number;
  lng?: number;
  location?: string;
  category?: string;
  images?: string[];
  sourceType: string;
}

export interface SyncJobConfig {
  provider: string;
  type: "STAY" | "DINING" | "ACTIVITY";
  enabled: boolean;
  location: {
    lat: number;
    lng: number;
    radius: number; // meters
  };
  placeTypes?: string[];
}

// Default sync configurations
export const DEFAULT_SYNC_CONFIG = {
  location: {
    lat: 3.5728,
    lng: 101.6411,
    radius: 15000, // 15km radius around KKB
  },
  stayPlaceTypes: ["lodging", "hotel", "resort", "guest_house"],
  diningPlaceTypes: ["restaurant", "cafe", "food", "bakery", "meal_takeaway"],
  activityPlaceTypes: ["tourist_attraction", "park", "natural_feature", "point_of_interest"],
};

