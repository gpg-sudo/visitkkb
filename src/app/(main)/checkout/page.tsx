"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Users,
  Shield,
  CreditCard,
  Wallet,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type PaymentMethod = "card" | "fpx" | "ewallet";

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  country: string;
  specialRequests: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalCost, participantCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    country: "MY",
    specialRequests: "",
  });

  // Pre-fill user details if authenticated
  useEffect(() => {
    if (user) {
      setCustomerDetails((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/activities");
    }
  }, [items.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create bookings for each cart item
      const bookingPromises = items.map(async (item) => {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingType: "ACTIVITY",
            itemId: item.activityId,
            startDate: item.date,
            participants: item.participants.length,
            customerDetails: {
              name: customerDetails.name,
              email: customerDetails.email,
              phone: customerDetails.phone,
            },
            participantDetails: item.participants,
            specialRequests: customerDetails.specialRequests,
            paymentMethod: paymentMethod,
            operatorId: item.operatorId,
            insurance: item.insurance,
            totalAmount: item.totalPrice,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Booking failed");
        }

        return data;
      });

      const results = await Promise.all(bookingPromises);
      
      // Clear cart and redirect to confirmation
      clearCart();
      
      // Get first booking confirmation code for display
      const confirmationCode = results[0]?.data?.confirmationCode || "PENDING";
      router.push(`/checkout/confirmation?code=${confirmationCode}&count=${results.length}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/activities">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Details</CardTitle>
                    <CardDescription>
                      We&apos;ll use this to send your booking confirmation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!isAuthenticated && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                        <p className="text-sm">
                          <Link href="/login" className="text-primary font-medium hover:underline">
                            Sign in
                          </Link>{" "}
                          to speed up checkout and view your bookings later
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Full Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          placeholder="John Doe"
                          value={customerDetails.name}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={customerDetails.email}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">
                          Phone Number <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="tel"
                          placeholder="+60 12-345 6789"
                          value={customerDetails.phone}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, phone: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Country</label>
                        <select
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                          value={customerDetails.country}
                          onChange={(e) =>
                            setCustomerDetails({ ...customerDetails, country: e.target.value })
                          }
                        >
                          <option value="MY">Malaysia</option>
                          <option value="SG">Singapore</option>
                          <option value="ID">Indonesia</option>
                          <option value="TH">Thailand</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Special Requests (Optional)
                      </label>
                      <textarea
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[80px]"
                        placeholder="Any dietary requirements, accessibility needs, or special occasions?"
                        value={customerDetails.specialRequests}
                        onChange={(e) =>
                          setCustomerDetails({ ...customerDetails, specialRequests: e.target.value })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Booking Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Bookings</CardTitle>
                    <CardDescription>
                      {items.length} {items.length === 1 ? "activity" : "activities"} • {participantCount}{" "}
                      {participantCount === 1 ? "participant" : "participants"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-muted/50">
                        {item.activityImage && (
                          <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                            <Image
                              src={item.activityImage}
                              alt={item.activityTitle}
                              fill
                              className="object-cover"
                              unoptimized={item.activityImage.startsWith("http")}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{item.activityTitle}</h4>
                          <div className="text-sm text-muted-foreground space-y-1 mt-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.date).toLocaleDateString("en-MY", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              {item.participants.length}{" "}
                              {item.participants.length === 1 ? "person" : "people"}
                            </div>
                            {item.insurance && (
                              <div className="flex items-center gap-2 text-primary">
                                <Shield className="h-3 w-3" />
                                Insurance included
                              </div>
                            )}
                          </div>
                          <div className="text-sm mt-1">
                            Operator: <span className="font-medium">{item.operatorName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">RM {item.totalPrice}</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Payment Method
                    </CardTitle>
                    <CardDescription>Select your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="sr-only"
                      />
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">
                          Visa, Mastercard, American Express
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === "card"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "fpx"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="fpx"
                        checked={paymentMethod === "fpx"}
                        onChange={() => setPaymentMethod("fpx")}
                        className="sr-only"
                      />
                      <Wallet className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">FPX Online Banking</div>
                        <div className="text-sm text-muted-foreground">
                          Direct debit from your Malaysian bank account
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === "fpx"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        paymentMethod === "ewallet"
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="ewallet"
                        checked={paymentMethod === "ewallet"}
                        onChange={() => setPaymentMethod("ewallet")}
                        className="sr-only"
                      />
                      <Wallet className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">E-Wallet</div>
                        <div className="text-sm text-muted-foreground">
                          Touch &apos;n Go, Boost, GrabPay
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          paymentMethod === "ewallet"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      />
                    </label>

                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-4">
                      <Lock className="h-3 w-3" />
                      Your payment information is encrypted and secure
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items breakdown */}
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[180px]">
                          {item.activityTitle} x{item.participants.length}
                        </span>
                        <span>RM {item.pricePerPerson * item.participants.length}</span>
                      </div>
                    ))}

                    {/* Insurance */}
                    {items.some((item) => item.insurance) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Insurance</span>
                        <span>RM {items.reduce((sum, item) => sum + item.insuranceCost, 0)}</span>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">RM {totalCost}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Includes all taxes and fees
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col gap-4">
                    {error && (
                      <div className="w-full flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <p>{error}</p>
                      </div>
                    )}

                    <label className="flex items-start gap-2 text-sm cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300"
                      />
                      <span>
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link href="/cancellation" className="text-primary hover:underline">
                          Cancellation Policy
                        </Link>
                      </span>
                    </label>

                    <Button
                      type="submit"
                      className="w-full gap-2"
                      size="lg"
                      disabled={isSubmitting || !agreedToTerms}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Complete Booking
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Free cancellation up to 24 hours before your activity
                    </p>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

