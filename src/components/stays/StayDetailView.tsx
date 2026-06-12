'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    MapPin,
    Star,
    Users,
    Bed,
    ChevronLeft,
    Check,
    ExternalLink,
    Map as MapIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface StayDetailViewProps {
    stay: {
        id: string;
        title: string;
        slug: string;
        description: string;
        shortDescription?: string | null;
        image: string | null;
        gallery: string[]; // Parsed array
        location: string;
        lat: number | null;
        lng: number | null;
        pricePerNight: number;
        type: string;
        amenities: string[]; // Parsed array
        rating: number;
        reviewCount: number;
        maxGuests: number;
        rooms: number;
        checkInTime?: string | null;
        checkOutTime?: string | null;
        googlePlaceId?: string | null;
        googleMapsUrl?: string | null;
        website?: string | null;
        phone?: string | null;
        currency?: string | null;
        address?: string | null;
        affiliateDeepLink?: string | null;
    };
    googleMapsApiKey?: string;
}

export default function StayDetailView({ stay, googleMapsApiKey }: StayDetailViewProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    // Fallback image
    const mainImage =
        stay.image || '/images/placeholders/stay-default.jpg';
    // Ensure main image is first in gallery for viewing
    const allImages = [mainImage, ...stay.gallery.filter(img => img !== mainImage)];
    // Deduplicate
    const uniqueImages = Array.from(new Set(allImages)).slice(0, 6);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Back Button */}
            <div className="container mx-auto px-4 py-4">
                <Link href="/stays">
                    <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Stays
                    </Button>
                </Link>
            </div>

            {/* Hero Section */}
            <div className="container mx-auto px-4 mb-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative h-[400px] w-full rounded-xl overflow-hidden shadow-md">
                            <Image
                                src={uniqueImages[selectedImage] || '/images/placeholder-stay.jpg'}
                                alt={stay.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {uniqueImages.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {uniqueImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                    >
                                        <Image
                                            src={img}
                                            alt={`${stay.title} ${idx + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Key Info */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20">
                                    {stay.type}
                                </Badge>
                                {stay.rating > 0 && (
                                    <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{stay.rating.toFixed(1)}</span>
                                        <span className="text-muted-foreground">({stay.reviewCount} reviews)</span>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-foreground">
                                {stay.title}
                            </h1>

                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span>{stay.location}</span>
                            </div>
                            {stay.address && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {stay.address}
                                </p>
                            )}

                            {stay.shortDescription && (
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    {stay.shortDescription}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Capacity</p>
                                    <p className="text-sm text-muted-foreground">Up to {stay.maxGuests} guests</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-primary/10 text-primary">
                                    <Bed className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Bedrooms</p>
                                    <p className="text-sm text-muted-foreground">{stay.rooms} {stay.rooms === 1 ? 'Room' : 'Rooms'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {stay.googleMapsUrl && (
                                <Button asChild variant="outline" className="gap-2">
                                    <a href={stay.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                                        <MapIcon className="h-4 w-4" />
                                        View on Google Maps
                                    </a>
                                </Button>
                            )}
                            {stay.website && (
                                <Button asChild variant="outline" className="gap-2">
                                    <a href={stay.website} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                        Visit Website
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="container mx-auto px-4">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">About this place</h2>
                            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground">
                                <p>{stay.description}</p>
                            </div>
                        </section>

                        {/* Amenities */}
                        {stay.amenities.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-4">What this place offers</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                                    {stay.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <Check className="h-5 w-5 text-primary flex-shrink-0" />
                                            <span className="text-foreground/80">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Map */}
                        {stay.lat && stay.lng && googleMapsApiKey && (
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Where you&apos;ll be</h2>
                                <div className="rounded-xl overflow-hidden border shadow-sm h-[400px] w-full bg-muted relative">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${stay.lat},${stay.lng}`}
                                    ></iframe>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {stay.location}
                                </p>
                            </section>
                        )}
                    </div>

                    {/* Right Column (Sticky Sidebar) */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 shadow-lg border-primary/10">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-2xl font-bold text-primary">
                                            {(stay.currency || 'MYR')} {stay.pricePerNight}
                                            <span className="text-sm font-normal text-muted-foreground"> / night</span>
                                        </p>
                                        {stay.rating > 0 && (
                                            <div className="flex items-center gap-1 text-sm mt-1">
                                                <Star className="h-3 w-3 fill-current text-amber-500" />
                                                <span className="font-medium">{stay.rating.toFixed(1)}</span>
                                                <span className="text-muted-foreground">({stay.reviewCount} reviews)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Check-in</span>
                                        <span className="font-medium">{stay.checkInTime || '15:00'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Check-out</span>
                                        <span className="font-medium">{stay.checkOutTime || '11:00'}</span>
                                    </div>
                                </div>

                                {stay.affiliateDeepLink ? (
                                    <Button
                                        className="w-full text-lg py-6"
                                        size="lg"
                                        asChild
                                    >
                                        <a
                                            href={stay.affiliateDeepLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Book Now
                                        </a>
                                    </Button>
                                ) : (
                                    <Button className="w-full text-lg py-6" size="lg" disabled>
                                        Book Now
                                    </Button>
                                )}

                                <p className="text-xs text-center text-muted-foreground">
                                    Data partially sourced from Google Places
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
