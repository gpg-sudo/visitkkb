export interface Operator {
  id: string;
  name: string;
  type: "company" | "guide";
  specialization: string[];
  rating: number;
  experience: string;
  certifications?: string[];
  contact?: string;
  logo?: string;
}

export const operators: Record<string, Operator[]> = {
  "white-water-rafting": [
    {
      id: "op-1",
      name: "Selangor River Adventures",
      type: "company",
      specialization: ["White Water Rafting", "River Safety"],
      rating: 4.8,
      experience: "15 years",
      certifications: [
        "Malaysian Rafting Association",
        "Safety First Certified",
      ],
      contact: "+60 12-345 6789",
    },
    {
      id: "op-2",
      name: "Rapids Pro Malaysia",
      type: "company",
      specialization: ["White Water Rafting", "Team Building"],
      rating: 4.7,
      experience: "12 years",
      certifications: ["International Rafting Federation"],
      contact: "+60 12-987 6543",
    },
  ],
  "chiling-waterfall-hike": [
    {
      id: "guide-1",
      name: "Ahmad bin Hassan",
      type: "guide",
      specialization: ["Jungle Trekking", "Wildlife Spotting"],
      rating: 4.9,
      experience: "10 years",
      certifications: ["Certified Mountain Guide", "First Aid"],
    },
    {
      id: "guide-2",
      name: "Siti Nurhaliza",
      type: "guide",
      specialization: ["Nature Photography", "Jungle Trekking"],
      rating: 4.8,
      experience: "8 years",
      certifications: ["Eco-Tourism Guide"],
    },
  ],
  "paragliding-experience": [
    {
      id: "guide-3",
      name: "Captain Lee Wei Ming",
      type: "guide",
      specialization: ["Paragliding", "Aerial Photography"],
      rating: 4.9,
      experience: "12 years",
      certifications: ["APPI Certified Pilot", "Tandem Instructor"],
    },
    {
      id: "guide-4",
      name: "Sarah Tan",
      type: "guide",
      specialization: ["Paragliding", "Safety Training"],
      rating: 4.7,
      experience: "7 years",
      certifications: ["APPI Certified", "Emergency Response"],
    },
  ],
  "historical-town-walk": [
    {
      id: "guide-5",
      name: "Encik Rahman",
      type: "guide",
      specialization: ["Local History", "Heritage Conservation"],
      rating: 4.6,
      experience: "20 years",
      certifications: ["Heritage Guide License"],
    },
  ],
  "night-jungle-trek": [
    {
      id: "guide-6",
      name: "David Wong",
      type: "guide",
      specialization: ["Night Wildlife", "Jungle Safety"],
      rating: 4.8,
      experience: "9 years",
      certifications: ["Wildlife Guide", "First Aid"],
    },
  ],
  "bukit-kutu-hiking": [
    {
      id: "guide-7",
      name: "Muthu Krishnan",
      type: "guide",
      specialization: ["Mountain Hiking", "Navigation"],
      rating: 4.9,
      experience: "15 years",
      certifications: ["Mountain Guide", "Search & Rescue"],
    },
  ],
  "hot-spring-relaxation": [
    {
      id: "guide-8",
      name: "Wellness KKB",
      type: "company",
      specialization: ["Hot Spring Management", "Wellness Tourism"],
      rating: 4.5,
      experience: "5 years",
      contact: "+60 12-456 7890",
    },
  ],
  "stargazing-selangor-dam": [
    {
      id: "guide-9",
      name: "Dr. Azman Astronomy",
      type: "guide",
      specialization: ["Astronomy", "Astrophotography"],
      rating: 4.9,
      experience: "18 years",
      certifications: ["Certified Astronomer", "Science Educator"],
    },
    {
      id: "guide-10",
      name: "Starlight Tours",
      type: "company",
      specialization: ["Stargazing Tours", "Night Sky Education"],
      rating: 4.7,
      experience: "6 years",
      contact: "+60 12-789 0123",
    },
  ],
  "fishing-chiling-sanctuary": [
    {
      id: "guide-11",
      name: "Pak Ali Fishing Guide",
      type: "guide",
      specialization: ["Freshwater Fishing", "Conservation"],
      rating: 4.4,
      experience: "25 years",
      certifications: ["Fishing Guide License"],
    },
  ],
  "atv-adventure-trail": [
    {
      id: "op-3",
      name: "KKB ATV Adventures",
      type: "company",
      specialization: ["ATV Tours", "Off-Road Safety"],
      rating: 4.7,
      experience: "8 years",
      certifications: ["ATV Safety Certified", "Trail Management"],
      contact: "+60 12-234 5678",
    },
    {
      id: "op-4",
      name: "Jungle Riders",
      type: "company",
      specialization: ["ATV Expeditions", "Adventure Tourism"],
      rating: 4.6,
      experience: "10 years",
      certifications: ["Off-Road Certified"],
      contact: "+60 12-345 6789",
    },
  ],
  "mountain-biking-trail": [
    {
      id: "guide-12",
      name: "Cycling KKB",
      type: "company",
      specialization: ["Mountain Biking", "Trail Guides"],
      rating: 4.6,
      experience: "7 years",
      certifications: ["Cycling Coach", "Trail Safety"],
      contact: "+60 12-567 8901",
    },
    {
      id: "guide-13",
      name: "Raju Bike Tours",
      type: "guide",
      specialization: ["Mountain Biking", "Local Routes"],
      rating: 4.5,
      experience: "12 years",
      certifications: ["Cycling Guide"],
    },
  ],
  "lata-medang-waterfall-hike": [
    {
      id: "guide-14",
      name: "Jungle Explorers KKB",
      type: "company",
      specialization: ["Waterfall Trekking", "Jungle Navigation"],
      rating: 4.7,
      experience: "9 years",
      certifications: ["Wilderness Guide", "First Aid"],
      contact: "+60 12-678 9012",
    },
  ],
  "cherandong-waterfall-trek": [
    {
      id: "guide-15",
      name: "Aziz Nature Guide",
      type: "guide",
      specialization: ["Waterfall Tours", "Local Flora"],
      rating: 4.6,
      experience: "11 years",
      certifications: ["Nature Guide License"],
    },
  ],
  "lata-makau-jungle-trek": [
    {
      id: "guide-16",
      name: "Extreme Trails Malaysia",
      type: "company",
      specialization: ["Advanced Trekking", "Jungle Expeditions"],
      rating: 4.8,
      experience: "13 years",
      certifications: ["Advanced Jungle Guide", "Rescue Certified"],
      contact: "+60 12-890 1234",
    },
  ],
  "kelah-sanctuary-visit": [
    {
      id: "guide-17",
      name: "KKB Eco Tours",
      type: "company",
      specialization: ["Eco Tourism", "Wildlife Education"],
      rating: 4.4,
      experience: "6 years",
      contact: "+60 12-901 2345",
    },
  ],
  "ampang-pecah-historic-site": [
    {
      id: "guide-18",
      name: "Local Heritage Guides",
      type: "company",
      specialization: ["Local Attractions", "Family Tours"],
      rating: 4.3,
      experience: "8 years",
      contact: "+60 12-012 3456",
    },
  ],
  "taman-milenium-lake-walk": [
    {
      id: "guide-19",
      name: "KKB Walking Tours",
      type: "company",
      specialization: ["Walking Tours", "Fitness Activities"],
      rating: 4.2,
      experience: "4 years",
      contact: "+60 12-123 4567",
    },
  ],
  "lake-pelasari-kayaking": [
    {
      id: "op-5",
      name: "Pelasari Water Sports",
      type: "company",
      specialization: ["Kayaking", "Water Activities"],
      rating: 4.7,
      experience: "10 years",
      certifications: ["Kayaking Instructor", "Water Safety"],
      contact: "+60 12-234 5678",
    },
  ],
  "pelasari-fishing-experience": [
    {
      id: "guide-20",
      name: "Uncle Tan Fishing",
      type: "guide",
      specialization: ["Freshwater Fishing", "Local Knowledge"],
      rating: 4.5,
      experience: "30 years",
      certifications: ["Fishing Guide"],
    },
  ],
  "kkb-street-art-walk": [
    {
      id: "guide-21",
      name: "KKB Heritage Society",
      type: "company",
      specialization: ["History", "Culture", "Art"],
      rating: 4.8,
      experience: "15 years",
      contact: "+60 19-876 5432",
    },
  ],
  "ltdl-climbing-route": [
    {
      id: "guide-22",
      name: "Peak Performance Cycles",
      type: "company",
      specialization: ["Road Cycling", "Mountain Biking"],
      rating: 4.9,
      experience: "12 years",
      contact: "+60 17-654 3210",
    },
  ],
};
