"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Calendar, Mail, Phone, Download, Home, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const confirmationCode = searchParams.get("code") || "PENDING";
  const bookingCount = parseInt(searchParams.get("count") || "1");

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
            <CardDescription>
              Your adventure in Kuala Kubu Bharu awaits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confirmation Code */}
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Confirmation Code</p>
              <p className="text-2xl font-mono font-bold tracking-wider text-primary">
                {confirmationCode}
              </p>
              {bookingCount > 1 && (
                <p className="text-sm text-muted-foreground mt-1">
                  +{bookingCount - 1} more booking{bookingCount > 2 ? "s" : ""}
                </p>
              )}
            </div>

            {/* What's Next */}
            <div className="text-left space-y-4">
              <h3 className="font-semibold">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Check your email</p>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ve sent a confirmation with all the details
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Operator will contact you</p>
                    <p className="text-sm text-muted-foreground">
                      Within 24 hours to confirm meeting point and timing
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Show up and enjoy!</p>
                    <p className="text-sm text-muted-foreground">
                      Arrive on time and have an amazing experience
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <Button className="w-full gap-2" variant="outline">
                <Download className="h-4 w-4" />
                Download Confirmation
              </Button>

              {isAuthenticated ? (
                <Link href="/account" className="block">
                  <Button className="w-full gap-2" variant="default">
                    <User className="h-4 w-4" />
                    View My Bookings
                  </Button>
                </Link>
              ) : (
                <Link href="/" className="block">
                  <Button className="w-full gap-2" variant="default">
                    <Home className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              )}
            </div>

            {/* Additional Info */}
            <div className="text-sm text-muted-foreground pt-4 border-t">
              <p>
                Need help?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact us
                </Link>{" "}
                or call{" "}
                <a href="tel:+60123456789" className="text-primary hover:underline">
                  +60 12-345 6789
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Explore More */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">Looking for more adventures?</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/activities">
              <Button variant="outline" size="sm">
                More Activities
              </Button>
            </Link>
            <Link href="/stays">
              <Button variant="outline" size="sm">
                Find Accommodation
              </Button>
            </Link>
            <Link href="/dining">
              <Button variant="outline" size="sm">
                Where to Eat
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}

