"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Clock, Heart, Users } from "lucide-react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Activity } from "@/lib/data/activities";

interface ActivityCardProps {
    activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
    return (
        <Card className="overflow-hidden flex flex-col h-full group border-0 shadow-md hover:shadow-xl transition-all duration-300">
            <Link href={`/activities/${activity.slug}`} className="relative h-64 w-full overflow-hidden block">
                <Image
                    src={activity.image || "/images/placeholder.jpg"}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-500"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-white/90 backdrop-blur-sm hover:bg-white text-foreground border-0 shadow-sm">
                        {activity.difficulty}
                    </Badge>
                    {activity.tags && activity.tags[0] && (
                        <Badge className="bg-primary/90 text-primary-foreground border-0 shadow-sm">
                            {activity.tags[0]}
                        </Badge>
                    )}
                    {activity.imageSource === "AI_GENERATED_FALLBACK" && (
                        <Badge className="bg-purple-600/90 text-white border-0 shadow-sm text-[10px] py-0 px-2">
                            AI Generated Preview
                        </Badge>
                    )}
                </div>
                <button
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors text-white"
                    onClick={(e) => {
                        e.preventDefault();
                        // Handle favorite logic
                    }}
                >
                    <Heart className="h-5 w-5" />
                </button>
            </Link>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                        <CardTitle className="text-xl mb-2 font-bold group-hover:text-primary transition-colors line-clamp-1">
                            {activity.title}
                        </CardTitle>
                        <div className="flex items-center text-muted-foreground text-sm">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-primary" />
                            <span className="truncate">{activity.location}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full text-xs font-bold text-primary shrink-0">
                        <Star className="h-3 w-3 fill-primary" />
                        {activity.rating.toFixed(1)}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {activity.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        {activity.duration}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        Up to {activity.maxParticipants} pax
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-muted p-6 bg-muted/30">
                <div>
                    <p className="text-2xl font-black text-primary">
                        {activity.price}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Per Person</p>
                </div>
                <Link href={`/activities/${activity.slug}`}>
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                        Book Now
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
