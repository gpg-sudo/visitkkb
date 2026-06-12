export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: "Guide" | "History" | "Food" | "Nature";
  readTime: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Ultimate Guide to Chilling Waterfall",
    slug: "ultimate-guide-chilling-waterfall",
    excerpt:
      "Everything you need to know about hiking to one of Selangor's most beautiful waterfalls. Tips on permits, gear, and best times to visit.",
    content: "Full content here...",
    author: "Sarah Lee",
    date: "October 15, 2025",
    image:
      "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=800&auto=format&fit=crop",
    category: "Nature",
    readTime: "5 min read",
  },
  {
    id: "2",
    title: "5 Must-Try Local Delicacies in KKB",
    slug: "5-must-try-local-delicacies-kkb",
    excerpt:
      "From the famous Kaya Puffs to authentic Hainanese Chicken Chop, here are the dishes you cannot miss when visiting Kuala Kubu Bharu.",
    content: "Full content here...",
    author: "Ahmad Razak",
    date: "September 28, 2025",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    category: "Food",
    readTime: "4 min read",
  },
  {
    id: "3",
    title: "A Walk Through Time: KKB's Colonial Architecture",
    slug: "walk-through-time-kkb-colonial-architecture",
    excerpt:
      "Explore the history behind the town's unique layout and well-preserved buildings. A self-guided walking tour itinerary included.",
    content: "Full content here...",
    author: "Elena Gomez",
    date: "August 10, 2025",
    image:
      "https://images.unsplash.com/photo-1599708153386-52e2b5099529?q=80&w=800&auto=format&fit=crop",
    category: "History",
    readTime: "7 min read",
  },
  {
    id: "4",
    title: "Paragliding for Beginners: What to Expect",
    slug: "paragliding-beginners-what-to-expect",
    excerpt:
      "Taking to the skies for the first time? Here's a breakdown of the tandem paragliding experience at Bukit Batu Pahat.",
    content: "Full content here...",
    author: "Mike Chen",
    date: "July 5, 2025",
    image:
      "https://images.unsplash.com/photo-1526662092594-e98c1e356527?q=80&w=800&auto=format&fit=crop",
    category: "Guide",
    readTime: "6 min read",
  },
];
