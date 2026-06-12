// Booking.com API Integration Service

interface BookingProperty {
  hotelId: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  reviewScore: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  photos: string[];
  amenities: string[];
  coordinates: { lat: number; lng: number };
  description: string;
  url: string;
}

interface BookingHotelApiResponse {
  hotel_id: number | string;
  hotel_name?: string;
  name?: string;
  address?: string;
  city?: string;
  class?: number;
  hotel_class?: number;
  review_score?: number;
  min_total_price?: number;
  max_total_price?: number;
  price_breakdown?: { gross_price?: number };
  currency_code?: string;
  photos?: Array<{ url_max1280?: string; url_original?: string }>;
  facilities?: string[];
  hotel_facilities?: string[];
  latitude?: number;
  longitude?: number;
  hotel_description?: string;
  url?: string;
  [key: string]: unknown;
}

interface PrismaClient {
  stay: {
    findFirst: (args: unknown) => Promise<unknown>;
    create: (args: unknown) => Promise<unknown>;
  };
  operator: {
    findFirst: (args: unknown) => Promise<{ id: string } | null>;
    create: (args: unknown) => Promise<{ id: string }>;
  };
}

class BookingService {
  private apiKey: string;
  private baseUrl = "https://booking-com.p.rapidapi.com/v1";
  private headers: HeadersInit;

  constructor() {
    this.apiKey = process.env.BOOKING_API_KEY || "";
    this.headers = {
      "X-RapidAPI-Key": this.apiKey,
      "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
    };
  }

  /**
   * Search for hotels in a location
   */
  async searchHotels(
    location: string = "Kuala Kubu Bharu",
    checkIn?: string,
    checkOut?: string,
    adults: number = 2,
  ): Promise<BookingProperty[]> {
    try {
      // First, get the destination ID
      const destId = await this.getDestinationId(location);
      if (!destId) {
        console.log("Destination not found, using mock data");
        return this.getMockHotels();
      }

      const params = new URLSearchParams({
        dest_id: destId,
        dest_type: "city",
        adults: adults.toString(),
        ...(checkIn && { checkin_date: checkIn }),
        ...(checkOut && { checkout_date: checkOut }),
        order_by: "popularity",
        filter_by_currency: "MYR",
        room_number: "1",
        units: "metric",
        locale: "en-gb",
      });

      const url = `${this.baseUrl}/hotels/search?${params}`;

      const response = await fetch(url, { headers: this.headers });
      const data = await response.json();

      if (data.result && Array.isArray(data.result)) {
        return data.result.map((hotel: BookingHotelApiResponse) =>
          this.formatHotelData(hotel),
        );
      }

      return this.getMockHotels();
    } catch (error) {
      console.error("Booking.com search error:", error);
      return this.getMockHotels();
    }
  }

  /**
   * Get destination ID for a location
   */
  private async getDestinationId(location: string): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/hotels/locations?name=${encodeURIComponent(location)}&locale=en-gb`;

      const response = await fetch(url, { headers: this.headers });
      const data = await response.json();

      if (data && data.length > 0) {
        return data[0].dest_id;
      }

      return null;
    } catch (error) {
      console.error("Get destination ID error:", error);
      return null;
    }
  }

  /**
   * Get hotel details
   */
  async getHotelDetails(hotelId: string): Promise<BookingProperty | null> {
    try {
      const url = `${this.baseUrl}/hotels/data?hotel_id=${hotelId}&locale=en-gb`;

      const response = await fetch(url, { headers: this.headers });
      const data = await response.json();

      if (data) {
        return this.formatHotelData(data);
      }

      return null;
    } catch (error) {
      console.error("Get hotel details error:", error);
      return null;
    }
  }

  /**
   * Format hotel data to our structure
   */
  private formatHotelData(hotel: BookingHotelApiResponse): BookingProperty {
    return {
      hotelId: hotel.hotel_id?.toString() || "",
      name: hotel.hotel_name || hotel.name || "",
      address: hotel.address || "",
      city: hotel.city || "",
      rating: hotel.class || hotel.hotel_class || 0,
      reviewScore: hotel.review_score || 0,
      minPrice:
        hotel.min_total_price || hotel.price_breakdown?.gross_price || 0,
      maxPrice:
        hotel.max_total_price || hotel.price_breakdown?.gross_price || 0,
      currency: hotel.currency_code || "MYR",
      photos:
        hotel.photos?.map((p) => p.url_max1280 || p.url_original || "") || [],
      amenities: hotel.facilities || hotel.hotel_facilities || [],
      coordinates: {
        lat: hotel.latitude || 0,
        lng: hotel.longitude || 0,
      },
      description: hotel.hotel_description || "",
      url: hotel.url || `https://www.booking.com/hotel/${hotel.hotel_id}.html`,
    };
  }

  /**
   * Mock data for when API is not available
   */
  private getMockHotels(): BookingProperty[] {
    return [
      {
        hotelId: "mock-1",
        name: "The Heritage Kuala Kubu Bharu",
        address: "Jalan Dato Muda, 44000 Kuala Kubu Bharu",
        city: "Kuala Kubu Bharu",
        rating: 3,
        reviewScore: 8.5,
        minPrice: 150,
        maxPrice: 250,
        currency: "MYR",
        photos: [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
        ],
        amenities: ["WiFi", "Air Conditioning", "Parking", "Breakfast"],
        coordinates: { lat: 3.6672, lng: 101.6534 },
        description: "Charming heritage hotel in the heart of KKB town",
        url: "https://www.booking.com",
      },
    ];
  }

  /**
   * Sync hotels from Booking.com to our database
   */
  async syncHotelsToDatabase(prisma: PrismaClient): Promise<number> {
    try {
      const hotels = await this.searchHotels("Kuala Kubu Bharu");
      let synced = 0;

      for (const hotel of hotels) {
        try {
          // Check if hotel already exists
          const existing = await prisma.stay.findFirst({
            where: {
              OR: [{ title: hotel.name }, { slug: this.slugify(hotel.name) }],
            },
          });

          if (existing) {
            console.log(`Hotel already exists: ${hotel.name}`);
            continue;
          }

          // Get or create operator
          let operator = await prisma.operator.findFirst({
            where: { name: "Booking.com Integration" },
          });

          if (!operator) {
            operator = await prisma.operator.create({
              data: {
                name: "Booking.com Integration",
                email: "integration@visitkkb.com",
                phone: "+60000000000",
                description: "Properties synced from Booking.com",
                verified: true,
              },
            });
          }

          // Create stay
          await prisma.stay.create({
            data: {
              title: hotel.name,
              slug: this.slugify(hotel.name),
              description:
                hotel.description ||
                `${hotel.rating}-star property in ${hotel.city}`,
              longDescription: hotel.description,
              image: hotel.photos[0] || "",
              gallery: JSON.stringify(hotel.photos),
              location: hotel.address,
              coordinates: JSON.stringify(hotel.coordinates),
              pricePerNight: hotel.minPrice,
              type: "Hotel",
              amenities: hotel.amenities.join(","),
              maxGuests: 2,
              rooms: 1,
              operatorId: operator.id,
              status: "ACTIVE",
            },
          });

          synced++;
          console.log(`Synced: ${hotel.name}`);
        } catch (error) {
          console.error(`Error syncing hotel ${hotel.name}:`, error);
        }
      }

      return synced;
    } catch (error) {
      console.error("Sync hotels error:", error);
      return 0;
    }
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  }
}

export const bookingService = new BookingService();
export default bookingService;
