/**
 * sync-photos.ts
 * 
 * Scans the database for records that:
 *   1. Are using external/placeholder images but have a matching local hero image 
 *      in /public/images/activities/
 *   2. Have null/empty images
 * 
 * Then updates the DB to use the best available local or sensible fallback image.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE = path.join(process.cwd(), 'public', 'images');
const ACTIVITIES_DIR = path.join(IMAGES_BASE, 'activities');
const GOOGLE_SOURCED_DIR = path.join(IMAGES_BASE, 'google_sourced');

// Check if a local file exists, returns the public URL path or null
function checkLocalActivity(slug: string): string | null {
  const heroPath = path.join(ACTIVITIES_DIR, `${slug}-hero.jpg`);
  if (fs.existsSync(heroPath)) return `/images/activities/${slug}-hero.jpg`;
  
  const pngPath = path.join(ACTIVITIES_DIR, `${slug}.png`);
  if (fs.existsSync(pngPath)) return `/images/activities/${slug}.png`;

  return null;
}

// Determine if an image URL is "external" (not a local /images/ path)
function isExternalUrl(url: string | null): boolean {
  if (!url) return true;
  return url.startsWith('http://') || url.startsWith('https://');
}

// Determine if an image is a low-res thumbnail (Google small thumbnails)
function isLowResGoogleThumb(url: string | null): boolean {
  if (!url) return false;
  // Google thumbnail URLs with small dimensions like w80-h92, w122-h92, w138-h92, w163-h92, w177-h92
  return /lh3\.googleusercontent\.com.*w(?:80|122|138|163|177)-h/.test(url);
}

// Upgrade low-res Google images to full size
function upgradeGoogleImageRes(url: string): string {
  // Replace small dimension params with 1920x1080
  return url.replace(/w\d+-h\d+-k-no/, 'w1920-h1080-k-no');
}

async function main() {
  let activitiesUpdated = 0;
  let staysUpdated = 0;
  let restaurantsUpdated = 0;

  console.log('🔍 Scanning activities for missing/suboptimal photos...\n');

  // ─── Activities ─────────────────────────────────────────────────────────────
  const activities = await prisma.activity.findMany({
    select: { id: true, title: true, slug: true, image: true },
  });

  for (const activity of activities) {
    const localImage = checkLocalActivity(activity.slug);
    let newImage: string | null = null;
    let reason = '';

    if (localImage && isExternalUrl(activity.image)) {
      // We have a local hero image — always prefer it
      newImage = localImage;
      reason = `replaced external URL with local hero image`;
    } else if (!activity.image) {
      newImage = localImage ?? '/images/placeholders/activity-default.jpg';
      reason = `was null — set to ${newImage}`;
    }

    if (newImage && newImage !== activity.image) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { image: newImage },
      });
      console.log(`✅ Activity "${activity.title}": ${reason}`);
      console.log(`   ${activity.image ?? 'null'} → ${newImage}\n`);
      activitiesUpdated++;
    } else {
      console.log(`⏭️  Activity "${activity.title}": image OK (${isExternalUrl(activity.image) ? 'external, no local available' : 'local'})`);
    }
  }

  console.log('\n🔍 Scanning stays for missing/low-res photos...\n');

  // ─── Stays ───────────────────────────────────────────────────────────────────
  const stays = await prisma.stay.findMany({
    select: { id: true, title: true, slug: true, image: true },
  });

  for (const stay of stays) {
    let newImage: string | null = null;
    let reason = '';

    if (!stay.image) {
      newImage = '/images/google_sourced/camping.jpg';
      reason = `was null — set to generic stays image`;
    } else if (isLowResGoogleThumb(stay.image)) {
      newImage = upgradeGoogleImageRes(stay.image);
      reason = `upgraded low-res Google thumbnail to full resolution`;
    }

    if (newImage && newImage !== stay.image) {
      await prisma.stay.update({
        where: { id: stay.id },
        data: { image: newImage },
      });
      console.log(`✅ Stay "${stay.title}": ${reason}`);
      console.log(`   ${stay.image ?? 'null'} → ${newImage}\n`);
      staysUpdated++;
    } else {
      console.log(`⏭️  Stay "${stay.title}": image OK`);
    }
  }

  console.log('\n🔍 Scanning restaurants for missing photos...\n');

  // ─── Restaurants ─────────────────────────────────────────────────────────────
  const restaurants = await prisma.restaurant.findMany({
    select: { id: true, name: true, slug: true, image: true },
  });

  // No local restaurant images — just upgrade low-res and fill nulls
  const restaurantFallback = '/images/google_sourced/kkb-town.jpg';

  for (const restaurant of restaurants) {
    let newImage: string | null = null;
    let reason = '';

    if (!restaurant.image) {
      newImage = restaurantFallback;
      reason = `was null — set to generic KKB town image`;
    } else if (isLowResGoogleThumb(restaurant.image)) {
      newImage = upgradeGoogleImageRes(restaurant.image);
      reason = `upgraded low-res Google thumbnail to full resolution`;
    }

    if (newImage && newImage !== restaurant.image) {
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { image: newImage },
      });
      console.log(`✅ Restaurant "${restaurant.name}": ${reason}`);
      console.log(`   ${restaurant.image ?? 'null'} → ${newImage}\n`);
      restaurantsUpdated++;
    } else {
      console.log(`⏭️  Restaurant "${restaurant.name}": image OK`);
    }
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 Sync Complete!');
  console.log(`   Activities updated : ${activitiesUpdated} / ${activities.length}`);
  console.log(`   Stays updated      : ${staysUpdated} / ${stays.length}`);
  console.log(`   Restaurants updated: ${restaurantsUpdated} / ${restaurants.length}`);
  console.log('═══════════════════════════════════════════\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
