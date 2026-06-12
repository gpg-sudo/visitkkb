import { events } from "@/lib/data/events";
import { EventCard } from "@/components/events/EventCard";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-serif font-bold mb-3 text-foreground">
            Upcoming Events
          </h1>
          <p className="text-muted-foreground">
            Discover festivals, races, and community gatherings happening in and
            around Kuala Kubu Bharu.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="p-12 border-2 border-dashed border-muted rounded-lg bg-muted/20 w-full max-w-2xl">
            <p className="text-lg font-medium text-muted-foreground">
              No upcoming events at the moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon for new announcements and experiences.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

















