export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  category: "Festival" | "Music" | "Sports" | "Culture" | "Nature";
}

export const events: Event[] = [
  {
    id: "1",
    title: "KKB International Paragliding Championship",
    date: "May 15-17, 2025",
    location: "Bukit Batu Pahat",
    description:
      "Witness world-class paragliders compete in the skies of KKB. A thrilling spectacle for all ages.",
    image:
      "https://images.unsplash.com/photo-1526662092594-e98c1e356527?q=80&w=800&auto=format&fit=crop",
    category: "Sports",
  },
  {
    id: "2",
    title: "Fraser's Hill International Bird Race",
    date: "June 21-22, 2025",
    location: "Fraser's Hill (Near KKB)",
    description:
      "Join birdwatchers from around the globe in this annual race to spot the most species of migratory birds.",
    image:
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?q=80&w=800&auto=format&fit=crop",
    category: "Nature",
  },
  {
    id: "3",
    title: "KKB Heritage Food Festival",
    date: "August 30, 2025",
    location: "KKB Town Center",
    description:
      "A celebration of local culinary delights. Taste traditional kaya puffs, ginger tea, and more.",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
    category: "Festival",
  },
  {
    id: "4",
    title: "Selangor River Rafting Challenge",
    date: "October 10, 2025",
    location: "Sungai Selangor",
    description:
      "Adrenaline-pumping white water rafting competition. Open to amateur and professional teams.",
    image:
      "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?q=80&w=800&auto=format&fit=crop",
    category: "Sports",
  },
];
