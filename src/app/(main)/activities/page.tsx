import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ArrowRight, MapPin, Clock, Star, Users, Mountain, Waves, Bike, Camera, TreePine, Moon, Coffee, Compass } from "lucide-react";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

// Activity categories for KKB
const activityCategories = [
  {
    id: "adventure",
    title: "Adventure",
    description: "Heart-pumping thrills await",
    image: "/images/activities/white-water-rafting.png",
    icon: Compass,
    color: "from-orange-600/80 to-red-700/80",
    subLinks: [
      { label: "White Water Rafting", href: "/activities?category=rafting" },
      { label: "ATV Adventure", href: "/activities?category=atv" },
      { label: "Paragliding", href: "/activities?category=paragliding" },
    ],
    tags: ["Water Sports", "Adventure", "ATV", "Flying"],
  },
  {
    id: "hiking",
    title: "Hiking & Waterfalls",
    description: "Explore pristine jungle trails",
    image: "/images/activities/chiling-waterfall.png",
    icon: Mountain,
    color: "from-emerald-600/80 to-green-800/80",
    subLinks: [
      { label: "Waterfall Treks", href: "/activities?category=waterfall" },
      { label: "Mountain Hiking", href: "/activities?category=hiking" },
      { label: "Jungle Trails", href: "/activities?category=jungle" },
    ],
    tags: ["Hiking", "Waterfall", "Nature", "Mountain"],
  },
  {
    id: "water",
    title: "Water Sports",
    description: "Lakes, rivers & adventures",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    icon: Waves,
    color: "from-blue-600/80 to-cyan-700/80",
    subLinks: [
      { label: "Kayaking", href: "/activities?category=kayaking" },
      { label: "Fishing", href: "/activities?category=fishing" },
      { label: "River Activities", href: "/activities?category=river" },
    ],
    tags: ["Kayaking", "Fishing", "Water Sports", "Lake"],
  },
  {
    id: "cycling",
    title: "Cycling & Biking",
    description: "Scenic routes for all levels",
    image: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
    icon: Bike,
    color: "from-amber-600/80 to-orange-700/80",
    subLinks: [
      { label: "Mountain Biking", href: "/activities?category=biking" },
      { label: "LTDL Route", href: "/activities/ltdl-climbing-route" },
      { label: "Scenic Cycling", href: "/activities?category=cycling" },
    ],
    tags: ["Cycling", "Biking", "Fitness"],
  },
  {
    id: "culture",
    title: "Culture & Heritage",
    description: "Discover local history",
    image: "/images/activities/historical-town.png",
    icon: Camera,
    color: "from-purple-600/80 to-indigo-700/80",
    subLinks: [
      { label: "Historical Walks", href: "/activities?category=history" },
      { label: "Street Art Tour", href: "/activities/kkb-street-art-walk" },
      { label: "Heritage Sites", href: "/activities?category=culture" },
    ],
    tags: ["Culture", "History", "Walking", "Art"],
  },
  {
    id: "nature",
    title: "Nature & Wildlife",
    description: "Connect with nature",
    image: "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=800&q=80",
    icon: TreePine,
    color: "from-teal-600/80 to-emerald-700/80",
    subLinks: [
      { label: "Wildlife Sanctuaries", href: "/activities?category=wildlife" },
      { label: "Bird Watching", href: "/activities?category=nature" },
      { label: "Eco Tours", href: "/activities?category=eco" },
    ],
    tags: ["Nature", "Wildlife", "Family", "Relaxation"],
  },
  {
    id: "night",
    title: "Night Activities",
    description: "After dark adventures",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    icon: Moon,
    color: "from-slate-700/80 to-indigo-900/80",
    subLinks: [
      { label: "Stargazing", href: "/activities/stargazing-selangor-dam" },
      { label: "Night Jungle Trek", href: "/activities/night-jungle-trek" },
      { label: "Night Photography", href: "/activities?category=night" },
    ],
    tags: ["Night", "Stargazing"],
  },
  {
    id: "wellness",
    title: "Wellness & Relaxation",
    description: "Unwind in nature",
    image: "/images/activities/hot-spring.png",
    icon: Coffee,
    color: "from-rose-500/80 to-pink-700/80",
    subLinks: [
      { label: "Hot Springs", href: "/activities/hot-spring-relaxation" },
      { label: "Lake Walks", href: "/activities/taman-milenium-lake-walk" },
      { label: "Nature Retreats", href: "/activities?category=relaxation" },
    ],
    tags: ["Relaxation", "Wellness"],
  },
];

// Featured experiences data
const featuredExperiences = [
  {
    title: "A Day of Adventure in KKB",
    description: "Combine rafting, hiking, and local cuisine for the ultimate adventure day.",
    image: "/images/activities/white-water-rafting.png",
    readTime: "5 min read",
    href: "/blog/adventure-day-kkb",
  },
  {
    title: "Best Waterfalls Near KKB",
    description: "Discover hidden gems from Chiling to Lata Medang waterfalls.",
    image: "/images/activities/chiling-waterfall.png",
    readTime: "7 min read",
    href: "/blog/best-waterfalls-kkb",
  },
  {
    title: "Family Fun in Kuala Kubu Bharu",
    description: "Kid-friendly activities for a memorable family getaway.",
    image: "/images/activities/historical-town.png",
    readTime: "4 min read",
    href: "/blog/family-fun-kkb",
  },
];

// Nearby areas
const nearbyAreas = [
  { name: "Fraser's Hill", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", href: "/areas/frasers-hill" },
  { name: "Rawang", image: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&q=80", href: "/areas/rawang" },
  { name: "Tanjung Malim", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&q=80", href: "/areas/tanjung-malim" },
  { name: "Bukit Tinggi", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", href: "/areas/bukit-tinggi" },
];

// FAQs
const faqs = [
  {
    question: "What is there to do in Kuala Kubu Bharu?",
    answer: "KKB offers a variety of activities including white water rafting on Sungai Selangor, hiking to stunning waterfalls like Chiling and Lata Medang, paragliding over the hills, exploring historical sites, relaxing in natural hot springs, and cycling scenic routes including the famous LTDL climb to Fraser's Hill."
  },
  {
    question: "What are the best outdoor activities in KKB?",
    answer: "The top outdoor activities include white water rafting (Grade II-III rapids), hiking to multiple waterfalls (Chiling, Lata Medang, Cherandong), paragliding from Bukit Batu Pahat, kayaking at Lake Pelasari, mountain biking trails, and the challenging Bukit Kutu summit hike."
  },
  {
    question: "What are family-friendly activities in KKB?",
    answer: "Families can enjoy the hot springs at Taman Arif, easy walks around Taman Tasik Milenium, visiting the Kelah Fish Sanctuary, historical town walks, fishing at Lake Pelasari, and exploring the local street art murals."
  },
  {
    question: "When is the best time to visit KKB for activities?",
    answer: "KKB can be visited year-round. The dry season (March-September) is ideal for hiking and water activities. The rainy season (October-February) offers dramatic waterfall views but trails may be slippery. Weekdays are less crowded than weekends."
  },
];

export default async function ActivitiesPage() {
  // Fetch active activities from the database
  const dbActivities = await prisma.activity.findMany({
    where: { status: "ACTIVE" },
    include: { reviews: { select: { rating: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Count activities by category
  const getCategoryCount = (tags: string[]) => {
    return dbActivities.filter(activity => {
      const activityTags = activity.tags?.split(",").map(t => t.trim().toLowerCase()) || [];
      return tags.some(tag => activityTags.includes(tag.toLowerCase()));
    }).length;
  };

  // Get featured activities (highest rated)
  const featuredActivities = dbActivities
    .map(activity => ({
      ...activity,
      avgRating: activity.reviews.length > 0
        ? activity.reviews.reduce((sum, r) => sum + r.rating, 0) / activity.reviews.length
        : 0,
    }))
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <Image
          src="/images/activities/white-water-rafting.png"
          alt="Adventure in Kuala Kubu Bharu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center text-white">
            <p className="text-sm md:text-base uppercase tracking-[0.3em] mb-4 text-white/80">
              Kuala Kubu Bharu, Selangor
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6">
              Things to Do in KKB
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-white/90 leading-relaxed">
              From adrenaline-pumping adventures to peaceful nature retreats, 
              discover unforgettable experiences in Malaysia&apos;s hidden gem.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/80 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Activities for Every Explorer
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Just an hour from Kuala Lumpur, Kuala Kubu Bharu offers an incredible range of 
              outdoor adventures. Whether you&apos;re seeking heart-pumping thrills on the rapids, 
              peaceful hikes through ancient rainforests, or cultural discoveries in our 
              historic town—the perfect adventure awaits.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{dbActivities.length} Activities</span>
              </div>
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>1 Hour from KL</span>
              </div>
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full shadow-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>All Skill Levels</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activityCategories.map((category) => {
              const Icon = category.icon;
              const count = getCategoryCount(category.tags);
              
              return (
                <div
                  key={category.id}
                  className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={category.image.startsWith("http")}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color}`} />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="mb-2 opacity-80">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{category.title}</h3>
                    <p className="text-sm text-white/80 mb-4">{category.description}</p>
                    
                    {/* Sub-links */}
                    <div className="space-y-1 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      {category.subLinks.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="flex items-center gap-2 text-sm hover:underline"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                    
                    {/* See All Button */}
                    <Link
                      href={`/activities?category=${category.id}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                    >
                      See All {count > 0 && `(${count})`}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold">Top-Rated Experiences</h2>
              <p className="text-muted-foreground mt-2">Our most popular activities</p>
            </div>
            <Link href="/activities/all" className="hidden md:flex items-center gap-2 text-primary hover:underline">
              View All Activities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredActivities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.slug}`}
                className="group bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized={activity.image.startsWith("http")}
                  />
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-background/90 text-xs font-medium">
                    {activity.difficulty}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{activity.avgRating.toFixed(1)}</span>
                    </div>
                    <span className="text-primary font-bold">
                      RM {activity.pricePerPerson}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/activities/all" className="inline-flex items-center gap-2 text-primary hover:underline">
              View All Activities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nearby Areas */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-2">Explore Nearby</h2>
          <p className="text-muted-foreground mb-8">Discover more adventures in surrounding areas</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {nearbyAreas.map((area) => (
              <Link
                key={area.name}
                href={area.href}
                className="group relative h-48 rounded-xl overflow-hidden"
              >
                <Image
                  src={area.image}
                  alt={area.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold">{area.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Stories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif font-bold">Travel Stories</h2>
              <p className="text-muted-foreground mt-2">Inspiration for your next adventure</p>
            </div>
            <Link href="/blog" className="hidden md:flex items-center gap-2 text-primary hover:underline">
              See More Stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredExperiences.map((story) => (
              <Link
                key={story.title}
                href={story.href}
                className="group bg-background rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-muted-foreground mb-2">{story.readTime}</p>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {story.description}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-4 text-sm text-primary font-medium">
                    Read More
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-background border rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <h3 className="font-semibold pr-4">{faq.question}</h3>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 text-muted-foreground">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Ready to Explore?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Book your adventure today and discover why Kuala Kubu Bharu is 
            becoming Malaysia&apos;s favorite outdoor destination.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/activities/all"
              className="inline-flex items-center gap-2 px-8 py-3 bg-background text-foreground rounded-full font-medium hover:bg-background/90 transition-colors"
            >
              Browse All Activities
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore-map"
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-primary-foreground rounded-full font-medium hover:bg-primary-foreground/10 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Explore the Map
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
