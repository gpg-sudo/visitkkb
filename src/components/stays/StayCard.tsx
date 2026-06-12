'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Wifi, Car, Coffee, Wind, ExternalLink, Users } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatFromPrice, parseAmenities } from '@/utils/format';

// Support both old and new stay types (migration in progress)
interface StayData {
  id?: string | number;
  slug: string;
  title: string;
  image: string;
  type: string;
  location: string;
  description: string;
  rating?: number;
  reviewCount?: number;
  price?: string;
  pricePerNight?: number;
  priceFrom?: number | null;
  currency?: string;
  amenities: string[] | string;
  maxGuests?: number;
  isFeatured?: boolean;
  sourceType?: string;
  affiliateProvider?: string | null;
  affiliateDeepLink?: string | null;
}

interface StayCardProps {
  stay: StayData;
  showAffiliateButton?: boolean;
}

// icon mapping for common amenities
const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi,
  wifi: Wifi,
  Parking: Car,
  parking: Car,
  Kitchen: Coffee,
  kitchen: Coffee,
  'Air Conditioning': Wind,
  air_conditioning: Wind,
};

export function StayCard({ stay, showAffiliateButton = true }: StayCardProps) {
  // parse amenities (handle both string and array formats)
  const amenities = parseAmenities(stay.amenities);

  // figure out price display
  const priceText = stay.price ||
    (stay.pricePerNight ? formatPrice(stay.pricePerNight) :
      (stay.priceFrom ? formatFromPrice(stay.priceFrom) : 'Contact for price'));

  // handle booking click
  const handleBook = () => {
    if (stay.affiliateDeepLink) {
      // direct link available - use it
      window.open(stay.affiliateDeepLink, '_blank');
      return;
    }

    // fallback to our redirect endpoint
    window.open(`/api/stays/${stay.slug}/affiliate-redirect`, '_blank');
  };

  const hasAffiliate = !!(stay.affiliateProvider || stay.affiliateDeepLink);

  return (
    <Card className="overflow-hidden flex flex-col h-full group">
      <Link href={`/stays/${stay.slug}`}>
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={stay.image || '/images/stays/placeholder.jpg'}
            alt={stay.title}
            fill
            className="object-cover transition-transform group-hover:scale-105 duration-300"
          />

          {/* badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium tracking-wide shadow-sm text-foreground">
              {stay.type.replace(/_/g, ' ')}
            </span>
            {stay.isFeatured && (
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            )}
          </div>

          {/* source indicator for debugging */}
          {stay.sourceType === 'GOOGLE_TRAVEL' && (
            <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-[10px]">
              Via Google
            </div>
          )}
        </div>
      </Link>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xl mb-1 font-serif truncate">
              {stay.title}
            </CardTitle>
            <div className="flex items-center text-muted-foreground text-sm">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{stay.location}</span>
            </div>
          </div>

          {/* rating badge */}
          <div className="flex flex-col items-end gap-1">
            {(stay.rating || stay.rating === 0) && (
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs font-medium text-primary">
                <Star className="h-3 w-3 fill-primary" />
                {stay.rating.toFixed(1)}
              </div>
            )}
            {stay.reviewCount && stay.reviewCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {stay.reviewCount} reviews
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {stay.description}
        </p>

        {/* amenity chips - show first 3 */}
        <div className="flex flex-wrap gap-2">
          {amenities.slice(0, 3).map((amenity) => {
            const Icon = AMENITY_ICONS[amenity] || null;
            return (
              <div
                key={amenity}
                className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
              >
                {Icon && <Icon className="h-3 w-3 mr-1" />}
                {amenity.replace(/_/g, ' ')}
              </div>
            );
          })}
          {amenities.length > 3 && (
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              +{amenities.length - 3} more
            </div>
          )}
        </div>

        {/* guest capacity */}
        {stay.maxGuests && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            Up to {stay.maxGuests} guests
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4 bg-muted/10 gap-2">
        <div>
          <p className="text-lg font-bold text-primary">{priceText}</p>
          <p className="text-xs text-muted-foreground">per night</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/stays/${stay.slug}`}>
            <Button variant="outline" size="sm">Details</Button>
          </Link>
          {showAffiliateButton && (
            <Button size="sm" onClick={handleBook} className="gap-1">
              Book
              {hasAffiliate && <ExternalLink className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
