"use client";

import {
  X,
  Trash2,
  Calendar,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeItem, clearCart, totalCost } = useCart();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Your Bookings</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-2">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add activities to start planning your adventure!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                const activityCost =
                  item.pricePerPerson * item.participants.length;

                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">
                          {item.activityTitle}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 -mt-1"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(item.date).toLocaleDateString("en-MY", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {item.participants.length}{" "}
                        {item.participants.length === 1 ? "person" : "people"}
                      </div>
                      <div className="text-muted-foreground">
                        Operator: {item.operatorName}
                      </div>
                      {item.insurance && (
                        <div className="flex items-center gap-2 text-primary">
                          <Shield className="h-4 w-4" />
                          Insurance included
                        </div>
                      )}

                      {/* Expandable Participants */}
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="flex items-center gap-2 text-primary hover:underline pt-2"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Hide participants
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            View participants
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 border-t pt-3">
                          {item.participants.map((participant, pIndex) => (
                            <div
                              key={pIndex}
                              className="text-xs space-y-1 bg-muted/50 p-2 rounded"
                            >
                              <div className="font-semibold">
                                Participant {pIndex + 1}
                              </div>
                              <div>Name: {participant.name}</div>
                              <div>Email: {participant.email}</div>
                              <div>Phone: {participant.phone}</div>
                              <div>Age: {participant.age}</div>
                              <div>
                                Emergency: {participant.emergencyContact}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-3 border-t flex-col gap-2 items-start">
                      <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                        <span>Activity</span>
                        <span>RM {activityCost}</span>
                      </div>
                      {item.insurance && (
                        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                          <span>Insurance</span>
                          <span>RM {item.insuranceCost}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center w-full font-bold text-primary pt-1 border-t">
                        <span>Total</span>
                        <span>RM {item.totalPrice}</span>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">RM {totalCost}</span>
            </div>
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
