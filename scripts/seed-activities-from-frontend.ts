import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All 21 activities from src/lib/data/activities.ts
const frontendActivities = [
  {
    title: "White Water Rafting",
    slug: "white-water-rafting",
    description:
      "Adrenaline-pumping rafting adventure on the Selangor River. Suitable for beginners and intermediates.",
    pricePerPerson: 150,
    rating: 4.8,
    image: "/images/activities/white-water-rafting.png",
    duration: "4 Hours",
    difficulty: "Moderate",
    location: "Sungai Selangor",
    tags: ["Water Sports", "Adventure", "Group Friendly"],
    maxParticipants: 8,
  },
  {
    title: "Chiling Waterfall Hike",
    slug: "chiling-waterfall-hike",
    description:
      "Trek through the jungle and cross rivers to reach the spectacular Chiling Waterfall.",
    pricePerPerson: 50,
    rating: 4.9,
    image: "/images/activities/chiling-waterfall.png",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "Chiling Fish Sanctuary",
    tags: ["Hiking", "Nature", "Waterfall"],
    maxParticipants: 10,
  },
  {
    title: "Paragliding Experience",
    slug: "paragliding-experience",
    description:
      "Soar above the lush green hills of KKB and enjoy breathtaking aerial views.",
    pricePerPerson: 250,
    rating: 4.7,
    image: "/images/activities/paragliding.png",
    duration: "30 Mins",
    difficulty: "Easy",
    location: "Bukit Batu Pahat",
    tags: ["Flying", "Scenic", "Adventure"],
    maxParticipants: 2,
  },
  {
    title: "Historical Town Walk",
    slug: "historical-town-walk",
    description:
      "Guided walking tour exploring the colonial history and heritage buildings of Kuala Kubu Bharu.",
    pricePerPerson: 30,
    rating: 4.5,
    image: "/images/activities/historical-town.png",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Town Center",
    tags: ["Culture", "History", "Walking"],
    maxParticipants: 15,
  },
  {
    title: "Night Jungle Trek",
    slug: "night-jungle-trek",
    description:
      "Explore the rainforest at night and spot nocturnal wildlife with an experienced guide.",
    pricePerPerson: 80,
    rating: 4.6,
    image: "/images/activities/night-jungle.png",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "Pertak Forest",
    tags: ["Wildlife", "Nature", "Night"],
    maxParticipants: 8,
  },
  {
    title: "Bukit Kutu Hiking",
    slug: "bukit-kutu-hiking",
    description:
      "Challenging hike to the summit of Bukit Kutu for panoramic views and colonial ruins.",
    pricePerPerson: 60,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    duration: "6 Hours",
    difficulty: "Hard",
    location: "Kampung Pertak",
    tags: ["Hiking", "Mountain", "Challenge"],
    maxParticipants: 6,
  },
  {
    title: "Hot Spring Relaxation",
    slug: "hot-spring-relaxation",
    description:
      "Unwind in the natural hot springs of Taman Arif. Perfect for relaxation after a day of adventure.",
    pricePerPerson: 20,
    rating: 4.4,
    image: "/images/activities/hot-spring.png",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Taman Arif",
    tags: ["Relaxation", "Nature", "Wellness"],
    maxParticipants: 20,
  },
  {
    title: "Stargazing at Selangor Dam",
    slug: "stargazing-selangor-dam",
    description:
      "Experience the night sky like never before at Sungai Selangor Dam. Away from city lights, enjoy stunning views of stars and constellations.",
    pricePerPerson: 40,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Easy",
    location: "Sungai Selangor Dam",
    tags: ["Stargazing", "Night", "Scenic"],
    maxParticipants: 15,
  },
  {
    title: "Fishing at Chiling Sanctuary",
    slug: "fishing-chiling-sanctuary",
    description:
      "Enjoy a peaceful fishing experience at the Chiling Fish Sanctuary. Catch-and-release only to preserve the ecosystem.",
    pricePerPerson: 35,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    duration: "4 Hours",
    difficulty: "Easy",
    location: "Chiling Fish Sanctuary",
    tags: ["Fishing", "Nature", "Relaxation"],
    maxParticipants: 10,
  },
  {
    title: "ATV Adventure Trail",
    slug: "atv-adventure-trail",
    description:
      "Navigate through rugged terrain and jungle trails on an all-terrain vehicle. An exciting off-road experience for thrill-seekers.",
    pricePerPerson: 180,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80",
    duration: "2 Hours",
    difficulty: "Moderate",
    location: "Pertak Forest",
    tags: ["ATV", "Adventure", "Off-Road"],
    maxParticipants: 6,
  },
  {
    title: "Mountain Biking Trail",
    slug: "mountain-biking-trail",
    description:
      "Explore scenic mountain biking trails through forests and countryside. Suitable for intermediate to advanced cyclists.",
    pricePerPerson: 70,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "KKB Countryside",
    tags: ["Cycling", "Nature", "Fitness"],
    maxParticipants: 8,
  },
  {
    title: "Lata Medang Waterfall Hike",
    slug: "lata-medang-waterfall-hike",
    description:
      "Trek through pristine jungle to reach the stunning Lata Medang waterfall. A hidden gem with crystal clear pools perfect for swimming.",
    pricePerPerson: 45,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80",
    duration: "4 Hours",
    difficulty: "Moderate",
    location: "Lata Medang",
    tags: ["Hiking", "Waterfall", "Swimming"],
    maxParticipants: 12,
  },
  {
    title: "Cherandong Waterfall Trek",
    slug: "cherandong-waterfall-trek",
    description:
      "Adventure to the beautiful Cherandong waterfall through lush rainforest. Enjoy the natural pools and scenic surroundings.",
    pricePerPerson: 40,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Moderate",
    location: "Cherandong",
    tags: ["Hiking", "Waterfall", "Nature"],
    maxParticipants: 10,
  },
  {
    title: "Lata Makau Jungle Trek",
    slug: "lata-makau-jungle-trek",
    description:
      "Discover the secluded Lata Makau waterfall. A challenging but rewarding trek through dense jungle with spectacular natural scenery.",
    pricePerPerson: 55,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
    duration: "5 Hours",
    difficulty: "Hard",
    location: "Lata Makau",
    tags: ["Hiking", "Waterfall", "Adventure"],
    maxParticipants: 8,
  },
  {
    title: "Kelah Sanctuary Visit",
    slug: "kelah-sanctuary-visit",
    description:
      "Visit the Kelah Fish Sanctuary and observe the protected Kelah fish in their natural habitat. Educational and family-friendly.",
    pricePerPerson: 25,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Kelah Sanctuary",
    tags: ["Nature", "Wildlife", "Family"],
    maxParticipants: 20,
  },
  {
    title: "Ampang Pecah Historic Site",
    slug: "ampang-pecah-historic-site",
    description:
      "Visit the historic Ampang Pecah (Alor Lempah), site of the 1883 dam burst that destroyed old Kuala Kubu. Explore the river, remnants of the fallen dam, and enjoy picnics by the water.",
    pricePerPerson: 15,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
    duration: "2 Hours",
    difficulty: "Easy",
    location: "Ampang Pecah (Alor Lempah)",
    tags: ["Historic", "River", "Picnic"],
    maxParticipants: 25,
  },
  {
    title: "Taman Milenium Lake Walk",
    slug: "taman-milenium-lake-walk",
    description:
      "Enjoy a peaceful walk around Taman Tasik Milenium. Beautiful lake views, jogging tracks, and perfect for morning or evening strolls.",
    pricePerPerson: 10,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1596306499300-0b7b1689b9a6?w=800&q=80",
    duration: "1.5 Hours",
    difficulty: "Easy",
    location: "Taman Tasik Milenium",
    tags: ["Walking", "Lake", "Relaxation"],
    maxParticipants: 30,
  },
  {
    title: "Lake Pelasari Kayaking",
    slug: "lake-pelasari-kayaking",
    description:
      "Kayak on the serene Lake Pelasari surrounded by lush greenery and hills. Suitable for beginners and experienced paddlers.",
    pricePerPerson: 65,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    duration: "3 Hours",
    difficulty: "Easy",
    location: "Lake Pelasari",
    tags: ["Kayaking", "Lake", "Water Sports"],
    maxParticipants: 10,
  },
  {
    title: "Pelasari Fishing Experience",
    slug: "pelasari-fishing-experience",
    description:
      "Enjoy a relaxing fishing experience at Lake Pelasari. Catch local freshwater fish in a peaceful natural setting.",
    pricePerPerson: 30,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    duration: "4 Hours",
    difficulty: "Easy",
    location: "Lake Pelasari",
    tags: ["Fishing", "Lake", "Relaxation"],
    maxParticipants: 15,
  },
  {
    title: "Kuala Kubu Bharu Street Art Walk",
    slug: "kkb-street-art-walk",
    description:
      "Explore the vibrant back lanes of KKB adorned with murals depicting local life, history, and nature. A self-guided or guided cultural experience.",
    pricePerPerson: 30,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1580130712684-7f862825204d?w=800&q=80",
    duration: "1.5 Hours",
    difficulty: "Easy",
    location: "KKB Town Center",
    tags: ["Culture", "Art", "Walking"],
    maxParticipants: 20,
  },
  {
    title: "LTDL Climbing Route Cycling",
    slug: "ltdl-climbing-route",
    description:
      "Challenge yourself on the legendary Le Tour de Langkawi route from KKB to Fraser's Hill. A grueling 40km climb with 1200m elevation gain through scenic rainforests.",
    pricePerPerson: 150,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
    duration: "5 Hours",
    difficulty: "Hard",
    location: "KKB to Fraser's Hill",
    tags: ["Cycling", "Adventure", "Scenic"],
    maxParticipants: 10,
  },
];

// Categorize activities based on tags
function getMainCategory(tags: string[]): string {
  if (tags.some(t => ["Water Sports", "Kayaking"].includes(t))) return "Water Sports";
  if (tags.some(t => ["Hiking", "Mountain"].includes(t))) return "Hiking";
  if (tags.some(t => ["Cycling"].includes(t))) return "Cycling";
  if (tags.some(t => ["Culture", "History", "Art"].includes(t))) return "Culture";
  if (tags.some(t => ["Wildlife", "Nature"].includes(t))) return "Nature";
  if (tags.some(t => ["Relaxation", "Wellness"].includes(t))) return "Relaxation";
  if (tags.some(t => ["Adventure", "ATV", "Flying"].includes(t))) return "Adventure";
  return "Other";
}

// Featured activities (top-rated ones)
const featuredSlugs = [
  "white-water-rafting",
  "chiling-waterfall-hike",
  "stargazing-selangor-dam",
  "ltdl-climbing-route",
  "bukit-kutu-hiking",
];

async function main() {
  console.log("🌱 Starting activity migration from frontend to database...\n");

  // Get the first operator from the database
  const operator = await prisma.operator.findFirst();
  if (!operator) {
    console.error("❌ No operator found in database. Please create an operator first.");
    process.exit(1);
  }
  console.log(`✅ Using operator: ${operator.name} (ID: ${operator.id})\n`);

  let created = 0;
  let updated = 0;

  for (const item of frontendActivities) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _mainCategory = getMainCategory(item.tags);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _isFeatured = featuredSlugs.includes(item.slug);

    try {
      const activity = await prisma.activity.upsert({
        where: { slug: item.slug },
        update: {
          title: item.title,
          description: item.description,
          longDescription: item.description,
          location: item.location,
          pricePerPerson: item.pricePerPerson,
          difficulty: item.difficulty.toUpperCase(),
          duration: item.duration,
          maxParticipants: item.maxParticipants,
          tags: item.tags.join(","),
          image: item.image,
          gallery: JSON.stringify([item.image]),
          status: "ACTIVE",
          minAge: item.difficulty === "Easy" ? 8 : item.difficulty === "Moderate" ? 12 : 16,
        },
        create: {
          title: item.title,
          slug: item.slug,
          description: item.description,
          longDescription: item.description,
          location: item.location,
          pricePerPerson: item.pricePerPerson,
          difficulty: item.difficulty.toUpperCase(),
          duration: item.duration,
          maxParticipants: item.maxParticipants,
          tags: item.tags.join(","),
          image: item.image,
          gallery: JSON.stringify([item.image]),
          operatorId: operator.id,
          status: "ACTIVE",
          minAge: item.difficulty === "Easy" ? 8 : item.difficulty === "Moderate" ? 12 : 16,
          coordinates: null,
        },
      });

      const wasCreated = activity.createdAt >= new Date(Date.now() - 1000);
      if (wasCreated) {
        created++;
        console.log(`✅ Created: ${item.title} (${item.slug})`);
      } else {
        updated++;
        console.log(`🔄 Updated: ${item.title} (${item.slug})`);
      }
    } catch (error) {
      console.error(`❌ Failed to migrate: ${item.title}`, error);
    }
  }

  console.log(`\n✨ Migration complete!`);
  console.log(`   Created: ${created} activities`);
  console.log(`   Updated: ${updated} activities`);
  console.log(`   Total: ${created + updated} activities in database\n`);
}

main()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

