import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import StayDetailView from '@/components/stays/StayDetailView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getGooglePlaceDetails(placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,url&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const data = await res.json();
    return data.result;
  } catch (e) {
    console.error('Error fetching place details:', e);
    return null;
  }
}

export default async function StayPage({ params }: PageProps) {
  const { slug } = await params;

  const stay = await prisma.stay.findUnique({
    where: { slug },
  });

  if (!stay) {
    notFound();
  }

  // Parse JSON/String fields
  let gallery: string[] = [];
  try {
    gallery = stay.gallery ? JSON.parse(stay.gallery) : [];
  } catch (e) {
    console.error('Error parsing gallery:', e);
    gallery = [];
  }

  let amenities: string[] = [];
  if (stay.amenities) {
    amenities = stay.amenities.split(',').map(a => a.trim());
  }

  // Enrich with Google Places Details if available
  let googleDetails = null;
  // @ts-expect-error - externalPlaceId may not be in type definition
  if (stay.externalPlaceId) {
    // @ts-expect-error - externalPlaceId may not be in type definition
    googleDetails = await getGooglePlaceDetails(stay.externalPlaceId);
  }

  // Prepare data for view
  const viewData = {
    id: stay.id,
    title: stay.title,
    slug: stay.slug,
    description: stay.description,
    // @ts-expect-error - Types might be stale
    shortDescription: stay.shortDescription,
    image: stay.image,
    gallery: gallery,
    location: stay.location,
    // @ts-expect-error - lat may not be in type definition
    lat: stay.lat,
    // @ts-expect-error - lng may not be in type definition
    lng: stay.lng,
    pricePerNight: stay.pricePerNight,
    type: stay.type,
    amenities: amenities,
    // @ts-expect-error - rating may not be in type definition
    rating: stay.rating || 0,
    // @ts-expect-error - reviewCount may not be in type definition
    reviewCount: stay.reviewCount || 0,
    maxGuests: stay.maxGuests,
    rooms: stay.rooms,
    checkInTime: '15:00', // Default
    checkOutTime: '11:00', // Default
    // @ts-expect-error - externalPlaceId may not be in type definition
    googlePlaceId: stay.externalPlaceId,
    // @ts-expect-error - affiliateDeepLink may not be in type definition
    googleMapsUrl: googleDetails?.url || stay.affiliateDeepLink,
    website: googleDetails?.website,
    phone: googleDetails?.formatted_phone_number,
    currency: stay.currency,
    // @ts-expect-error - longDescription may not be in type definition
    address: stay.longDescription || null,
    // @ts-expect-error - affiliateDeepLink may not be in type definition
    affiliateDeepLink: stay.affiliateDeepLink || null,
  };

  return (
    <StayDetailView
      stay={viewData}
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
    />
  );
}
