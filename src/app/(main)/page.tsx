import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <Image
          src="/images/hero-main-wide.png"
          alt="Golden Hour Drone View of Ampangan Kuala Kubu Bharu"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-2xl tracking-tight">
            Welcome to <br /> Kuala Kubu Bharu
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl drop-shadow-lg font-medium">
            Adventure, heritage, and nature await in Selangor&apos;s hidden gem.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/plan">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-primary hover:bg-primary/90 text-white border-0">
                Plan Your Trip
              </Button>
            </Link>
            <Link href="/activities/all">
              <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg bg-white/10 hover:bg-white/20 text-white border-white backdrop-blur-sm">
                Explore Activities
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Intro Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <span className="text-primary font-bold tracking-widest uppercase text-sm mb-4 block">Discover KKB</span>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
            Ready to delve deeper? <br /> Your adventure starts here.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">
            Nestled at the foothills of the Titiwangsa Range, Kuala Kubu Bharu is a vibrant sanctuary. Wake up to misty mountains, challenge yourself with world-class white water rafting, or simply unwind in our natural hot springs.
          </p>
        </div>
      </section>

      {/* 3. Featured Categories - Simplified Queenstown Style */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-auto md:h-[500px]">
            {FEATURED_CATEGORIES.map((cat, idx) => (
              <Link key={cat.label} href={cat.href} className={`group relative overflow-hidden rounded-2xl block h-[300px] md:h-full ${idx === 0 || idx === 3 ? 'md:col-span-1' : 'md:col-span-1'}`}>
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-duration-700 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{cat.label}</h3>
                  <p className="text-white/80 text-sm md:text-base opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Highlight: Sustainability */}
      <section className="py-24 bg-[#0B231E] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Abstract pattern or texture could go here */}
          <Image
            src="/images/activities/kelah-sanctuary-visit-hero.jpg"
            alt="Background Texture"
            fill
            className="object-cover grayscale"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/images/google_sourced/rainforest.jpg"
                  alt="KKB Nature"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:w-1/2 text-center lg:text-left">
              <span className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4 block">Sustainable Travel</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                Preserving Our Heritage
              </h2>
              <p className="text-lg md:text-xl text-emerald-100/80 leading-relaxed mb-10 font-light">
                We&apos;re committed to keeping KKB pristine. From our plastic-free initiatives to river conservation projects, join us in protecting this biodiverse paradise for generations to come.
              </p>
              <Link href="/about">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 py-6 text-lg border-0">
                  Our Mission
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trip Ideas - Clean & Minimal */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Trip Inspiration</h2>
              <p className="text-gray-500 max-w-xl">Curated itineraries for every type of traveler.</p>
            </div>
            <Link href="/blog" className="hidden md:block">
              <div className="group flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors">
                View All Guides <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TRIP_IDEAS.map((idea) => (
              <Link key={idea.title} href="/blog" className="group block">
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden mb-6 shadow-sm">
                  <Image
                    src={idea.image}
                    alt={idea.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/95 backdrop-blur-sm text-xs font-extrabold uppercase tracking-wider text-black px-3 py-1.5 rounded-sm">
                      {idea.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 leading-tight">
                  {idea.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium">{idea.readTime}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link href="/blog">
              <Button variant="outline" className="rounded-full w-full">View All Guides</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Simple Events Banner (Instead of list) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gray-900 rounded-3xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-40">
              <Image src="/images/activities/night-jungle-trek-hero.jpg" alt="Events" fill className="object-cover" />
            </div>
            <div className="relative z-10 p-12 md:p-20 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">What&apos;s On in KKB?</h2>
              <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-10">
                From the International Bird Race to local fruit festivals, discover the vibrant events that bring our town to life.
              </p>
              <Link href="/events">
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10 py-6 text-lg font-bold border-0">
                  View Events Calendar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Seasons (Simplified) */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Seasons of KKB</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {SEASONS.map((season) => (
              <div key={season.title} className="text-center group cursor-default">
                <div className="relative aspect-square rounded-full overflow-hidden mb-6 mx-auto w-32 md:w-48 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <Image
                    src={season.image}
                    alt={season.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{season.title}</h3>
                <p className="text-primary font-medium text-sm">{season.months}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- SIMPLIFIED DATA ---

const FEATURED_CATEGORIES = [
  {
    label: "Adventures",
    description: "Rafting, Hiking & Thrills",
    href: "/activities/all?category=adventure",
    image: "/images/activities/white-water-rafting-hero.jpg"
  },
  {
    label: "Nature",
    description: "Waterfalls & Hot Springs",
    href: "/activities/all?category=nature",
    image: "/images/activities/chiling-waterfall-hike-hero.jpg"
  },
  {
    label: "Culture",
    description: "Heritage & Local Life",
    href: "/activities/all?category=culture",
    image: "/images/google_sourced/kkb-town.jpg"
  },
  {
    label: "Stay",
    description: "Retreats & Camping",
    href: "/stays",
    image: "/images/google_sourced/camping.jpg"
  }
];

const TRIP_IDEAS = [
  {
    title: "Heritage Walk: A Journey Through Colonial KKB",
    category: "Culture",
    readTime: "6 min read",
    image: "/images/google_sourced/kkb-town.jpg",
  },
  {
    title: "The Ultimate River Adventure Weekend",
    category: "Adventure",
    readTime: "8 min read",
    image: "/images/activities/white-water-rafting-hero.jpg",
  },
  {
    title: "Conquering Bukit Kutu: A Hiking Guide",
    category: "Hiking",
    readTime: "10 min read",
    image: "/images/activities/bukit-kutu-hiking-hero.jpg",
  },
];

const SEASONS = [
  { title: "Cool & Fresh", months: "Jan - Mar", image: "/images/google_sourced/frasers-hill.jpg" },
  { title: "Fruit Season", months: "Apr - Jun", image: "/images/google_sourced/durian.jpg" },
  { title: "Outdoor Season", months: "Jul - Sep", image: "/images/google_sourced/paragliding.jpg" },
  { title: "Misty Monsoon", months: "Oct - Dec", image: "/images/google_sourced/rainforest.jpg" },
];
