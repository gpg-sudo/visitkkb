// ============================================================================
// ⚠️ DEPRECATED: This file is no longer used
// ============================================================================
// All activities are now stored in the database and fetched dynamically.
// See: /app/(main)/activities/page.tsx for the new implementation
// Migration completed: All 21 activities migrated to database via scripts/seed-activities-from-frontend.ts
// ============================================================================

export interface Activity {
  id: string; // UUID from database
  title: string;
  description: string;
  price: string;
  pricePerPerson: number; // Numeric price for calculations
  rating: number;
  image: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  location: string;
  tags: string[];
  slug: string; // URL-friendly identifier
  maxParticipants: number;
  operatorIds: string; // Key to lookup operators/guides
  galleryImages?: string[];
  imageSource?: string | null;
}

// ⚠️ DEPRECATED: Use database instead
// @deprecated - Use Prisma Activity model instead
export const activities: Activity[] = [
  {
    id: "legacy-1",
    title: "White Water Rafting",
    slug: "white-water-rafting",
    description:
      "Adrenaline-pumping rafting adventure on the Selangor River. Suitable for beginners and intermediates.",
    price: "RM 150",
    pricePerPerson: 150,
    rating: 4.8,
    image: "/images/activities/white-water-rafting.png",
    duration: "4 Hours",
    difficulty: "Moderate",
    location: "Sungai Selangor",
    tags: ["Water Sports", "Adventure", "Group Friendly"],
    maxParticipants: 8,
    operatorIds: "white-water-rafting",
  },
  {
    id: "legacy-2",
    title: "Chiling Waterfall Hike",
    slug: "chiling-waterfall-hike",
    description:
      "Trek through the jungle and cross rivers to reach the spectacular Chiling Waterfall.",
    price: "RM 50",
    pricePerPerson: 50,
    rating: 4.9,
    image: "/images/activities/chiling-waterfall.png",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "Chiling Fish Sanctuary",
    tags: ["Hiking", "Nature", "Waterfall"],
    maxParticipants: 10,
    operatorIds: "chiling-waterfall-hike",
  },
  {
    id: "legacy-3",
    title: "Paragliding Experience",
    slug: "paragliding-experience",
    description:
      "Soar above the lush green hills of KKB and enjoy breathtaking aerial views.",
    price: "RM 250",
    pricePerPerson: 250,
    rating: 4.7,
    image: "/images/activities/paragliding.png",
    duration: "30 Mins",
    difficulty: "Easy",
    location: "Bukit Batu Pahat",
    tags: ["Flying", "Scenic", "Adventure"],
    maxParticipants: 2,
    operatorIds: "paragliding-experience",
  },
  {
    id: "legacy-4",
    title: "Historical Town Walk",
    slug: "historical-town-walk",
    description:
      "Guided walking tour exploring the colonial history and heritage buildings of Kuala Kubu Bharu.",
    price: "RM 30",
    pricePerPerson: 30,
    rating: 4.5,
    image: "/images/activities/historical-town.png",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Town Center",
    tags: ["Culture", "History", "Walking"],
    maxParticipants: 15,
    operatorIds: "historical-town-walk",
  },
  {
    id: "legacy-5",
    title: "Night Jungle Trek",
    slug: "night-jungle-trek",
    description:
      "Explore the rainforest at night and spot nocturnal wildlife with an experienced guide.",
    price: "RM 80",
    pricePerPerson: 80,
    rating: 4.6,
    image: "/images/activities/night-jungle.png",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "Pertak Forest",
    tags: ["Wildlife", "Nature", "Night"],
    maxParticipants: 8,
    operatorIds: "night-jungle-trek",
  },
  {
    id: "legacy-6",
    title: "Bukit Kutu Hiking",
    slug: "bukit-kutu-hiking",
    description:
      "Challenging hike to the summit of Bukit Kutu for panoramic views and colonial ruins.",
    price: "RM 60",
    pricePerPerson: 60,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    duration: "6 Hours",
    difficulty: "Hard",
    location: "Kampung Pertak",
    tags: ["Hiking", "Mountain", "Challenge"],
    maxParticipants: 6,
    operatorIds: "bukit-kutu-hiking",
  },
  {
    id: "legacy-7",
    title: "Hot Spring Relaxation",
    slug: "hot-spring-relaxation",
    description:
      "Unwind in the natural hot springs of Taman Arif. Perfect for relaxation after a day of adventure.",
    price: "RM 20",
    pricePerPerson: 20,
    rating: 4.4,
    image: "/images/activities/hot-spring.png",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Taman Arif",
    tags: ["Relaxation", "Nature", "Wellness"],
    maxParticipants: 20,
    operatorIds: "hot-spring-relaxation",
  },
  {
    id: "legacy-8",
    title: "Stargazing at Selangor Dam",
    slug: "stargazing-selangor-dam",
    description:
      "Experience the night sky like never before at Sungai Selangor Dam. Away from city lights, enjoy stunning views of stars and constellations.",
    price: "RM 40",
    pricePerPerson: 40,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Easy",
    location: "Sungai Selangor Dam",
    tags: ["Stargazing", "Night", "Scenic"],
    maxParticipants: 15,
    operatorIds: "stargazing-selangor-dam",
  },
  {
    id: "legacy-9",
    title: "Fishing at Chiling Sanctuary",
    slug: "fishing-chiling-sanctuary",
    description:
      "Enjoy a peaceful fishing experience at the Chiling Fish Sanctuary. Catch-and-release only to preserve the ecosystem.",
    price: "RM 35",
    pricePerPerson: 35,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    duration: "4 Hours",
    difficulty: "Easy",
    location: "Chiling Fish Sanctuary",
    tags: ["Fishing", "Nature", "Relaxation"],
    maxParticipants: 10,
    operatorIds: "fishing-chiling-sanctuary",
  },
  {
    id: "legacy-10",
    title: "ATV Adventure Trail",
    slug: "atv-adventure-trail",
    description:
      "Navigate through rugged terrain and jungle trails on an all-terrain vehicle. An exciting off-road experience for thrill-seekers.",
    price: "RM 180",
    pricePerPerson: 180,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    duration: "2 Hours",
    difficulty: "Moderate",
    location: "Pertak Forest",
    tags: ["ATV", "Adventure", "Off-Road"],
    maxParticipants: 6,
    operatorIds: "atv-adventure-trail",
  },
  {
    id: "legacy-11",
    title: "Mountain Biking Trail",
    slug: "mountain-biking-trail",
    description:
      "Explore scenic mountain biking trails through forests and countryside. Suitable for intermediate to advanced cyclists.",
    price: "RM 70",
    pricePerPerson: 70,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "KKB Countryside",
    tags: ["Cycling", "Nature", "Fitness"],
    maxParticipants: 8,
    operatorIds: "mountain-biking-trail",
  },
  {
    id: "legacy-12",
    title: "Lata Medang Waterfall Hike",
    slug: "lata-medang-waterfall-hike",
    description:
      "Trek through pristine jungle to reach the stunning Lata Medang waterfall. A hidden gem with crystal clear pools perfect for swimming.",
    price: "RM 45",
    pricePerPerson: 45,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    duration: "4 Hours",
    difficulty: "Moderate",
    location: "Lata Medang",
    tags: ["Hiking", "Waterfall", "Swimming"],
    maxParticipants: 12,
    operatorIds: "lata-medang-waterfall-hike",
  },
  {
    id: "legacy-13",
    title: "Cherandong Waterfall Trek",
    slug: "cherandong-waterfall-trek",
    description:
      "Adventure to the beautiful Cherandong waterfall through lush rainforest. Enjoy the natural pools and scenic surroundings.",
    price: "RM 40",
    pricePerPerson: 40,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "Cherandong",
    tags: ["Hiking", "Waterfall", "Nature"],
    maxParticipants: 10,
    operatorIds: "cherandong-waterfall-trek",
  },
  {
    id: "legacy-14",
    title: "Lata Makau Jungle Trek",
    slug: "lata-makau-jungle-trek",
    description:
      "Discover the secluded Lata Makau waterfall. A challenging but rewarding trek through dense jungle with spectacular natural scenery.",
    price: "RM 55",
    pricePerPerson: 55,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    duration: "5 Hours",
    difficulty: "Hard",
    location: "Lata Makau",
    tags: ["Hiking", "Waterfall", "Adventure"],
    maxParticipants: 8,
    operatorIds: "lata-makau-jungle-trek",
  },
  {
    id: "legacy-15",
    title: "Kelah Sanctuary Visit",
    slug: "kelah-sanctuary-visit",
    description:
      "Visit the Kelah Fish Sanctuary and observe the protected Kelah fish in their natural habitat. Educational and family-friendly.",
    price: "RM 25",
    pricePerPerson: 25,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Kelah Sanctuary",
    tags: ["Nature", "Wildlife", "Family"],
    maxParticipants: 20,
    operatorIds: "kelah-sanctuary-visit",
  },
  {
    id: "legacy-16",
    title: "Ampang Pecah Historic Site",
    slug: "ampang-pecah-historic-site",
    description:
      "Visit the historic Ampang Pecah (Alor Lempah), site of the 1883 dam burst that destroyed old Kuala Kubu. Explore the river, remnants of the fallen dam, and enjoy picnics by the water.",
    price: "RM 15",
    pricePerPerson: 15,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Ampang Pecah (Alor Lempah)",
    tags: ["Historic", "River", "Picnic"],
    maxParticipants: 25,
    operatorIds: "ampang-pecah-historic-site",
  },
  {
    id: "legacy-17",
    title: "Taman Milenium Lake Walk",
    slug: "taman-milenium-lake-walk",
    description:
      "Enjoy a peaceful walk around Taman Tasik Milenium. Beautiful lake views, jogging tracks, and perfect for morning or evening strolls.",
    price: "RM 10",
    pricePerPerson: 10,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1596306499300-0b7b1689b9a6?w=800&q=80",
    duration: "1.5 Hours",
    difficulty: "Easy",
    location: "Taman Tasik Milenium",
    tags: ["Walking", "Lake", "Relaxation"],
    maxParticipants: 30,
    operatorIds: "taman-milenium-lake-walk",
  },

  {
    id: "legacy-18",
    title: "Lake Pelasari Kayaking",
    slug: "lake-pelasari-kayaking",
    description:
      "Kayak on the serene Lake Pelasari surrounded by lush greenery and hills. Suitable for beginners and experienced paddlers.",
    price: "RM 65",
    pricePerPerson: 65,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Easy",
    location: "Lake Pelasari",
    tags: ["Kayaking", "Lake", "Water Sports"],
    maxParticipants: 10,
    operatorIds: "lake-pelasari-kayaking",
  },
  {
    id: "legacy-19",
    title: "Pelasari Fishing Experience",
    slug: "pelasari-fishing-experience",
    description:
      "Enjoy a relaxing fishing experience at Lake Pelasari. Catch local freshwater fish in a peaceful natural setting.",
    price: "RM 30",
    pricePerPerson: 30,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    duration: "4 Hours",
    difficulty: "Easy",
    location: "Lake Pelasari",
    tags: ["Fishing", "Lake", "Relaxation"],
    maxParticipants: 15,
    operatorIds: "pelasari-fishing-experience",
  },
  {
    id: "legacy-20",
    title: "Kuala Kubu Bharu Street Art Walk",
    slug: "kkb-street-art-walk",
    description:
      "Explore the vibrant back lanes of KKB adorned with murals depicting local life, history, and nature. A self-guided or guided cultural experience.",
    price: "RM 30",
    pricePerPerson: 30,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1580130712684-7f862825204d?w=800&q=80",
    duration: "1.5 Hours",
    difficulty: "Easy",
    location: "KKB Town Center",
    tags: ["Culture", "Art", "Walking"],
    maxParticipants: 20,
    operatorIds: "kkb-street-art-walk",
  },
  {
    id: "legacy-21",
    title: "LTDL Climbing Route Cycling",
    slug: "ltdl-climbing-route",
    description:
      "Challenge yourself on the legendary Le Tour de Langkawi route from KKB to Fraser's Hill. A grueling 40km climb with 1200m elevation gain through scenic rainforests.",
    price: "RM 150",
    pricePerPerson: 150,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
    duration: "5 Hours",
    difficulty: "Hard",
    location: "KKB to Fraser's Hill",
    tags: ["Cycling", "Adventure", "Scenic"],
    maxParticipants: 10,
    operatorIds: "ltdl-climbing-route",
  },
];
