// Agoda API Integration Service

interface AgodaProperty {
  propertyId: string;
  name: string;
  address: string;
  city: string;
  rating: number;
  reviewScore: number;
  price: number;
  currency: string;
  photos: string[];
  amenities: string[];
  coordinates: { lat: number; lng: number };
  description: string;
  url: string;
}

interface AgodaPropertyApiResponse {
  id?: string | number;
  propertyId?: string | number;
  name?: string;
  propertyName?: string;
  address?: string;
  city?: string;
  starRating?: number;
  rating?: number;
  reviewScore?: number;
  price?: number;
  pricePerNight?: number;
  currency?: string;
  images?: Array<{ url?: string } | string>;
  facilities?: string[];
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  location?: { lat?: number; lng?: number };
  description?: string;
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

class AgodaService {
  private apiKey: string;
  private baseUrl = "https://agoda-com.p.rapidapi.com/api/v1";
  private headers: HeadersInit;

  constructor() {
    this.apiKey = process.env.AGODA_API_KEY || "";
    this.headers = {
      "X-RapidAPI-Key": this.apiKey,
      "X-RapidAPI-Host": "agoda-com.p.rapidapi.com",
    };
  }

  /**
   * Search for properties in a location
   */
  async searchProperties(
    location: string = "Kuala Kubu Bharu",
    checkIn?: string,
    checkOut?: string,
    adults: number = 2,
  ): Promise<AgodaProperty[]> {
    try {
      const params = new URLSearchParams({
        location,
        adults: adults.toString(),
        ...(checkIn && { checkIn }),
        ...(checkOut && { checkOut }),
        currency: "MYR",
        locale: "en-us",
      });

      const url = `${this.baseUrl}/properties/list?${params}`;

      const response = await fetch(url, { headers: this.headers });
      const data = await response.json();

      if (data.properties && Array.isArray(data.properties)) {
        return data.properties.map((property: AgodaPropertyApiResponse) =>
          this.formatPropertyData(property),
        );
      }

      return this.getMockProperties();
    } catch (error) {
      console.error("Agoda search error:", error);
      return this.getMockProperties();
    }
  }

  /**
   * Get property details
   */
  async getPropertyDetails(propertyId: string): Promise<AgodaProperty | null> {
    try {
      const url = `${this.baseUrl}/properties/get-details?propertyId=${propertyId}`;

      const response = await fetch(url, { headers: this.headers });
      const data = await response.json();

      if (data) {
        return this.formatPropertyData(data);
      }

      return null;
    } catch (error) {
      console.error("Get property details error:", error);
      return null;
    }
  }

  /**
   * Format property data to our structure
   */
  private formatPropertyData(
    property: AgodaPropertyApiResponse,
  ): AgodaProperty {
    return {
      propertyId:
        property.id?.toString() || property.propertyId?.toString() || "",
      name: property.name || property.propertyName || "",
      address: property.address || "",
      city: property.city || "",
      rating: property.starRating || property.rating || 0,
      reviewScore: property.reviewScore || property.rating || 0,
      price: property.price || property.pricePerNight || 0,
      currency: property.currency || "MYR",
      photos:
        property.images?.map((img) =>
          typeof img === "string" ? img : img.url || "",
        ) || [],
      amenities: property.facilities || property.amenities || [],
      coordinates: {
        lat: property.latitude || property.location?.lat || 0,
        lng: property.longitude || property.location?.lng || 0,
      },
      description: property.description || "",
      url: property.url || `https://www.agoda.com/property/${property.id}`,
    };
  }

  /**
   * Mock data for when API is not available
   */
  private getMockProperties(): AgodaProperty[] {
    return [
      {
        propertyId: "mock-agoda-1",
        name: "KKB Riverside Resort",
        address: "Jalan Sungai Selangor, 44000 Kuala Kubu Bharu",
        city: "Kuala Kubu Bharu",
        rating: 4,
        reviewScore: 8.2,
        price: 200,
        currency: "MYR",
        photos: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
        ],
        amenities: ["Swimming Pool", "Restaurant", "WiFi", "Parking"],
        coordinates: { lat: 3.6668, lng: 101.6536 },
        description: "Beautiful riverside resort with modern amenities",
        url: "https://www.agoda.com",
      },
    ];
  }

  /**
   * Sync properties from Agoda to our database
   */
  async syncPropertiesToDatabase(prisma: PrismaClient): Promise<number> {
    try {
      const properties = await this.searchProperties("Kuala Kubu Bharu");
      let synced = 0;

      for (const property of properties) {
        try {
          // Check if property already exists
          const existing = await prisma.stay.findFirst({
            where: {
              OR: [
                { title: property.name },
                { slug: this.slugify(property.name) },
              ],
            },
          });

          if (existing) {
            console.log(`Property already exists: ${property.name}`);
            continue;
          }

          // Get or create operator
          let operator = await prisma.operator.findFirst({
            where: { name: "Agoda Integration" },
          });

          if (!operator) {
            operator = await prisma.operator.create({
              data: {
                name: "Agoda Integration",
                email: "integration@visitkkb.com",
                phone: "+60000000000",
                description: "Properties synced from Agoda",
                verified: true,
              },
            });
          }

          // Create stay
          await prisma.stay.create({
            data: {
              title: property.name,
              slug: this.slugify(property.name),
              description:
                property.description ||
                `${property.rating}-star property in ${property.city}`,
              longDescription: property.description,
              image: property.photos[0] || "",
              gallery: JSON.stringify(property.photos),
              location: property.address,
              coordinates: JSON.stringify(property.coordinates),
              pricePerNight: property.price,
              type: "Hotel",
              amenities: property.amenities.join(","),
              maxGuests: 2,
              rooms: 1,
              operatorId: operator.id,
              status: "ACTIVE",
            },
          });

          synced++;
          console.log(`Synced: ${property.name}`);
        } catch (error) {
          console.error(`Error syncing property ${property.name}:`, error);
        }
      }

      return synced;
    } catch (error) {
      console.error("Sync properties error:", error);
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

export const agodaService = new AgodaService();
export default agodaService;
