import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const fallbackImages = {
  MAMAK: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800", // Generic food
  CAFE: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800", // Cafe
  RESTAURANT: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800", // Restaurant
  STREET_FOOD: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800", // Street food
};

async function main() {
  const restaurants = await prisma.restaurant.findMany();
  
  for (const r of restaurants) {
    let newType = "RESTAURANT";
    let newImage = fallbackImages.RESTAURANT;
    
    const nameLower = r.name.toLowerCase();
    
    // Simple categorization heuristic
    if (nameLower.includes("mamak") || nameLower.includes("curry") || nameLower.includes("ferozpur")) {
      newType = "MAMAK";
      newImage = fallbackImages.MAMAK;
    } else if (nameLower.includes("cafe") || nameLower.includes("kopi")) {
      newType = "CAFE";
      newImage = fallbackImages.CAFE;
    } else if (nameLower.includes("warung") || nameLower.includes("gerai")) {
      newType = "STREET_FOOD";
      newImage = fallbackImages.STREET_FOOD;
    }

    console.log(`Updating ${r.name} to type ${newType}...`);
    
    await prisma.restaurant.update({
      where: { id: r.id },
      data: {
        type: newType,
        image: newImage // Replacing the potentially broken Google images with reliable Unsplash ones for now
      }
    });
  }
  
  console.log("Done updating restaurants.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
