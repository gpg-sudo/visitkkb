import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { Event } from "@/lib/data/events";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Card className="overflow-hidden flex flex-col h-full group">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-md">
          {event.category}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-serif line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.location}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/events/${event.id}`} className="w-full">
          <Button
            variant="outline"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          >
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
