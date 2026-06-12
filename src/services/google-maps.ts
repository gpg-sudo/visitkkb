// Google Maps API Integration Service

interface PlaceDetails {
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating?: number;
  photos?: string[];
  phone?: string;
  website?: string;
  openingHours?: string[];
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  [key: string]: unknown;
}

interface GooglePhoto {
  photo_reference: string;
  [key: string]: unknown;
}

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  [key: string]: unknown;
}

interface DistanceMatrixResult {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  status: string;
}

class GoogleMapsService {
  private apiKey: string;
  private baseUrl = "https://maps.googleapis.com/maps/api";

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
  }

  /**
   * Search for places in KKB area
   */
  async searchPlaces(
    query: string,
    type: "restaurant" | "lodging" | "tourist_attraction",
  ): Promise<GooglePlaceResult[]> {
    try {
      const location = "3.6667,101.6534"; // KKB coordinates
      const radius = 10000; // 10km radius

      const url = `${this.baseUrl}/place/nearbysearch/json?location=${location}&radius=${radius}&type=${type}&keyword=${encodeURIComponent(query)}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        return data.results;
      } else {
        console.error("Google Places API error:", data.status);
        return [];
      }
    } catch (error) {
      console.error("Google Maps search error:", error);
      return [];
    }
  }

  /**
   * Get detailed place information
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,rating,photos,formatted_phone_number,website,opening_hours,reviews&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result) {
        const result = data.result;

        return {
          name: result.name,
          address: result.formatted_address,
          location: {
            lat: result.geometry.location.lat,
            lng: result.geometry.location.lng,
          },
          rating: result.rating,
          photos: result.photos?.map(
            (p: GooglePhoto) =>
              `${this.baseUrl}/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${this.apiKey}`,
          ),
          phone: result.formatted_phone_number,
          website: result.website,
          openingHours: result.opening_hours?.weekday_text,
          reviews: result.reviews?.map((r: GoogleReview) => ({
            author: r.author_name,
            rating: r.rating,
            text: r.text,
            time: r.time,
          })),
        };
      }

      return null;
    } catch (error) {
      console.error("Get place details error:", error);
      return null;
    }
  }

  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(
    address: string,
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results[0]) {
        const location = data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }

      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  }

  /**
   * Get distance and duration between two points
   */
  async getDistanceMatrix(
    origin: string,
    destination: string,
  ): Promise<DistanceMatrixResult | null> {
    try {
      const url = `${this.baseUrl}/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${this.apiKey}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK") {
        return data.rows[0].elements[0];
      }

      return null;
    } catch (error) {
      console.error("Distance matrix error:", error);
      return null;
    }
  }

  /**
   * Search for restaurants in KKB
   */
  async searchRestaurants(query: string = ""): Promise<GooglePlaceResult[]> {
    return this.searchPlaces(
      `${query} restaurant Kuala Kubu Bharu`,
      "restaurant",
    );
  }

  /**
   * Search for hotels/lodging in KKB
   */
  async searchAccommodations(query: string = ""): Promise<GooglePlaceResult[]> {
    return this.searchPlaces(`${query} hotel Kuala Kubu Bharu`, "lodging");
  }

  /**
   * Search for tourist attractions in KKB
   */
  async searchAttractions(query: string = ""): Promise<GooglePlaceResult[]> {
    return this.searchPlaces(`${query} Kuala Kubu Bharu`, "tourist_attraction");
  }
}

export const googleMapsService = new GoogleMapsService();
export default googleMapsService;
