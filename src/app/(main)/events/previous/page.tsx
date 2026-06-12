import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function PreviousEventsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-serif font-bold mb-4 text-primary">
        Previous Events
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Take a look back at the memorable moments and successful events that
        have taken place in Kuala Kubu Bharu.
      </p>
      <div className="p-12 border-2 border-dashed border-muted rounded-lg bg-muted/20 w-full max-w-2xl mb-8">
        <p className="text-lg font-medium text-muted-foreground">
          No archived events available yet.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Check back later for event recaps and photo galleries.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
