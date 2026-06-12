export interface Stay {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  price?: string;
  pricePerNight: number; // Numeric price for calculations
  rating: number;
  image: string;
  images: string[]; // Gallery images
  type: string;
  location: string;
  amenities: string[];
  slug: string; // URL-friendly identifier
  capacity: number; // Max guests
  bedrooms?: number;
  bathrooms?: number;
  checkInTime?: string;
  checkOutTime?: string;
  rules?: string[];
  coordinates?: { lat: number; lng: number };
  experienceTags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const stays: Stay[] = [
  {
    id: "1",
    title: "The Hilltop Villa",
    slug: "hilltop-villa",
    description:
      "Luxury villa with panoramic views of the valley. Perfect for large families or groups.",
    fullDescription:
      "Experience luxury living at The Hilltop Villa, perched on the highest point in Kuala Kubu Bharu Heights. This stunning 4-bedroom villa offers breathtaking 360-degree views of the surrounding valley and mountains. The spacious open-plan living area flows seamlessly onto a large terrace with an infinity pool. Perfect for families or groups seeking a premium getaway with modern amenities and natural beauty.",
    price: "RM 450",
    pricePerNight: 450,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
    ],
    type: "Villa",
    location: "Kuala Kubu Bharu Heights",
    amenities: [
      "Pool",
      "WiFi",
      "Kitchen",
      "BBQ",
      "Parking",
      "Air Conditioning",
    ],
    capacity: 10,
    bedrooms: 4,
    bathrooms: 3,
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    rules: [
      "No smoking indoors",
      "No parties or events",
      "Pets allowed with prior approval",
    ],
  },
  {
    id: "2",
    title: "Riverfront Chalet",
    slug: "riverfront-chalet",
    description:
      "Cozy chalet right by the Selangor River. Fall asleep to the sound of flowing water.",
    fullDescription:
      "Escape to nature at the Riverfront Chalet, a charming wooden retreat situated directly on the banks of the Selangor River. Wake up to the soothing sounds of flowing water and enjoy your morning coffee on the private deck overlooking the river. This cozy 2-bedroom chalet is perfect for couples or small families looking for a peaceful riverside getaway.",
    price: "RM 280",
    pricePerNight: 280,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    ],
    type: "Chalet",
    location: "Sungai Selangor",
    amenities: [
      "River Access",
      "Parking",
      "Air Conditioning",
      "WiFi",
      "Kitchenette",
    ],
    capacity: 5,
    bedrooms: 2,
    bathrooms: 2,
    checkInTime: "2:00 PM",
    checkOutTime: "11:00 AM",
    rules: ["No smoking", "Quiet hours after 10 PM", "Maximum 5 guests"],
  },
  {
    id: "3",
    title: "Heritage Shophouse",
    slug: "heritage-shophouse",
    description:
      "Stay in a restored colonial-era shophouse in the heart of the town.",
    fullDescription:
      "Step back in time at the Heritage Shophouse, a beautifully restored colonial-era building in the heart of Kuala Kubu Bharu's historic town center. This unique accommodation combines old-world charm with modern comforts. The ground floor features a cozy cafe, while the upper floors house comfortable bedrooms with period furnishings. Perfect for history enthusiasts and culture lovers.",
    price: "RM 320",
    pricePerNight: 320,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    type: "Homestay",
    location: "Town Center",
    amenities: [
      "WiFi",
      "Cafe nearby",
      "Historical",
      "Air Conditioning",
      "Shared Kitchen",
    ],
    capacity: 6,
    bedrooms: 3,
    bathrooms: 2,
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
    rules: [
      "No smoking",
      "Respect historical property",
      "Quiet hours after 10 PM",
    ],
  },
  {
    id: "4",
    title: "Rainforest Retreat",
    slug: "rainforest-retreat",
    description:
      "Immerse yourself in nature at this eco-friendly resort tucked in the jungle.",
    fullDescription:
      "Discover tranquility at the Rainforest Retreat, an eco-friendly resort nestled deep in the lush jungle of Ampang Pechah. This sustainable property offers comfortable accommodations surrounded by pristine rainforest. Wake up to the sounds of tropical birds and enjoy guided nature walks on the property's private trails. The resort features a restaurant serving organic local cuisine and a wellness center.",
    price: "RM 380",
    pricePerNight: 380,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1571896349842-6e5c48dc52e3?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1571896349842-6e5c48dc52e3?w=800&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    ],
    type: "Resort",
    location: "Ampang Pechah",
    amenities: [
      "Hiking Trails",
      "Breakfast",
      "Garden",
      "WiFi",
      "Restaurant",
      "Spa",
    ],
    capacity: 4,
    bedrooms: 2,
    bathrooms: 2,
    checkInTime: "2:00 PM",
    checkOutTime: "12:00 PM",
    rules: [
      "Eco-friendly practices encouraged",
      "No single-use plastics",
      "Respect wildlife",
    ],
  },
  {
    id: "5",
    title: "Lakeside Glamping",
    slug: "lakeside-glamping",
    description:
      "Experience luxury camping by the serene lake. Stargazing at its best.",
    fullDescription:
      "Combine comfort with adventure at Lakeside Glamping, where luxury meets the great outdoors. Our spacious safari-style tents are fully furnished with comfortable beds, electricity, and private decks overlooking the tranquil Pertak Dam. Perfect for couples or adventurous families who want to experience nature without sacrificing comfort. Enjoy kayaking, fishing, and incredible stargazing opportunities.",
    price: "RM 250",
    pricePerNight: 250,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800&q=80",
      "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    ],
    type: "Campsite",
    location: "Pertak Dam",
    amenities: [
      "Campfire",
      "Shared Bathroom",
      "Kayaking",
      "Fishing",
      "Stargazing Deck",
    ],
    capacity: 4,
    checkInTime: "1:00 PM",
    checkOutTime: "11:00 AM",
    rules: [
      "No loud music",
      "Campfire only in designated areas",
      "Leave no trace",
    ],
  },
  {
    id: "6",
    title: "Modern Loft",
    slug: "modern-loft",
    description:
      "A stylish and contemporary loft apartment for a comfortable city-like stay.",
    fullDescription:
      "Enjoy urban comfort in the heart of KKB at the Modern Loft. This stylish contemporary apartment features high ceilings, modern furnishings, and all the amenities you need for a comfortable stay. The open-plan design includes a fully equipped kitchenette, comfortable living area with smart TV, and a cozy bedroom loft. Perfect for digital nomads, couples, or solo travelers seeking a modern base to explore KKB.",
    price: "RM 300",
    pricePerNight: 300,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
    ],
    type: "Homestay",
    location: "Town Center",
    amenities: [
      "WiFi",
      "Smart TV",
      "Kitchenette",
      "Air Conditioning",
      "Work Desk",
    ],
    capacity: 3,
    bedrooms: 1,
    bathrooms: 1,
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    rules: ["No smoking", "No parties", "Respect neighbors"],
  },
];
