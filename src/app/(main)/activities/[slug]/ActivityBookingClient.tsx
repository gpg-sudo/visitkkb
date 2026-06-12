"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Star,
  Users,
  ChevronLeft,
  Award,
  Shield,
  Sparkles,
} from "lucide-react";
import type { Activity } from "@/lib/data/activities";
import type { Operator } from "@/lib/data/operators";
import { useCart } from "@/contexts/CartContext";
import { Calendar } from "@/components/booking/Calendar";
import {
  ParticipantForm,
  type Participant,
} from "@/components/booking/ParticipantForm";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const INSURANCE_COST_PER_PERSON = 15; // RM 15 per person

interface ActivityBookingClientProps {
  activity: Activity;
  availableOperators: Operator[];
}

const DEFAULT_IMAGE = "/images/placeholders/activity-default.jpg";

export default function ActivityBookingClient({
  activity,
  availableOperators,
}: ActivityBookingClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<string>("");
  const [insurance, setInsurance] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  const imageSrc = activity.image && !imageError ? activity.image : DEFAULT_IMAGE;

  const handleAddToCart = () => {
    if (!selectedDate || !selectedOperator) {
      alert("Please select a date and operator/guide");
      return;
    }

    if (participants.length === 0) {
      alert("Please add at least one participant");
      return;
    }

    // Validate all participants have required fields
    const isValid = participants.every(
      (p) => p.name && p.email && p.phone && p.age && p.emergencyContact,
    );

    if (!isValid) {
      alert("Please fill in all participant details");
      return;
    }

    const operator = availableOperators.find(
      (op) => op.id === selectedOperator,
    );
    if (!operator) return;

    const activityCost = activity.pricePerPerson * participants.length;
    const insuranceCost = insurance
      ? INSURANCE_COST_PER_PERSON * participants.length
      : 0;
    const totalPrice = activityCost + insuranceCost;

    addItem({
      activityId: activity.id,
      activityTitle: activity.title,
      activitySlug: activity.slug,
      activityImage: activity.image,
      date: selectedDate.toISOString(),
      participants,
      operatorId: operator.id,
      operatorName: operator.name,
      pricePerPerson: activity.pricePerPerson,
      insurance,
      insuranceCost,
      totalPrice,
    });

    alert("Added to cart!");

    // Reset form
    setSelectedDate(null);
    setParticipants([]);
    setSelectedOperator("");
    setInsurance(false);
  };

  const difficultyColors = {
    Easy: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Moderate:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Hard: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  const activityCost = activity.pricePerPerson * participants.length;
  const insuranceCost = insurance
    ? INSURANCE_COST_PER_PERSON * participants.length
    : 0;
  const totalCost = activityCost + insuranceCost;

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/activities">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Activities
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative h-96 w-full bg-muted">
        <Image
          src={imageSrc}
          alt={activity.title}
          fill
          className="object-cover"
          priority
          onError={() => setImageError(true)}
          unoptimized={imageSrc.startsWith("http")}
        />
        <div className="absolute inset-0 bg-black/30" />
        {activity.imageSource === "AI_GENERATED_FALLBACK" && (
          <div className="absolute top-6 right-6 z-20">
            <Badge className="bg-purple-600/90 hover:bg-purple-600 text-white border-0 shadow-lg px-3 py-1 flex items-center gap-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI Generated Preview
            </Badge>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {activity.galleryImages && activity.galleryImages.length > 0 && (
        <div className="container mx-auto px-4 -mt-16 relative z-10 mb-8">
          <div className="grid grid-cols-4 gap-2 h-24 sm:h-32 md:h-40">
            {activity.galleryImages.slice(0, 4).map((img, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden shadow-lg border-2 border-white cursor-pointer hover:scale-105 transition-transform">
                <Image
                  src={img}
                  alt={`${activity.title} gallery ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={img.startsWith("http")}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-4xl font-bold">{activity.title}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-bold ${difficultyColors[activity.difficulty]}`}
                >
                  {activity.difficulty}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {activity.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {activity.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {activity.rating} Rating
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Max {activity.maxParticipants} people
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {activity.description}
                </p>
              </CardContent>
            </Card>

            {/* Operators/Guides */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {availableOperators[0]?.type === "company"
                    ? "Select Operator Company"
                    : "Select Guide"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableOperators.map((op) => (
                  <div
                    key={op.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedOperator === op.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                      }`}
                    onClick={() => setSelectedOperator(op.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{op.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {op.experience} experience
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        {op.rating}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {op.certifications?.map((cert) => (
                        <span
                          key={cert}
                          className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-md"
                        >
                          <Award className="h-3 w-3" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Participant Details */}
            <ParticipantForm
              participants={participants}
              onParticipantsChange={setParticipants}
            />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book This Activity</CardTitle>
                <p className="text-2xl font-bold text-primary">
                  RM {activity.pricePerPerson}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    per person
                  </span>
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Select Date
                  </label>
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    activityId={activity.id}
                  />
                </div>

                {/* Insurance */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={insurance}
                      onChange={(e) => setInsurance(e.target.checked)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-semibold">Add Insurance</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        RM {INSURANCE_COST_PER_PERSON} per person - Covers
                        medical emergencies and accidents
                      </p>
                    </div>
                  </label>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Activity ({participants.length}{" "}
                      {participants.length === 1 ? "person" : "people"})
                    </span>
                    <span>RM {activityCost}</span>
                  </div>
                  {insurance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Insurance</span>
                      <span>RM {insuranceCost}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold text-primary">
                      RM {totalCost}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={
                      !selectedDate ||
                      !selectedOperator ||
                      participants.length === 0
                    }
                  >
                    Add to Cart
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Free cancellation up to 24 hours before
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
