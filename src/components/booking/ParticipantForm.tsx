"use client";

import { useState } from "react";
import { User, Users, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  emergencyContact: string;
}

interface ParticipantFormProps {
  participants: Participant[];
  onParticipantsChange: (participants: Participant[]) => void;
}

export function ParticipantForm({
  participants,
  onParticipantsChange,
}: ParticipantFormProps) {
  const [bookingType, setBookingType] = useState<"individual" | "group">(
    "individual",
  );

  const addParticipant = () => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      age: "",
      emergencyContact: "",
    };
    onParticipantsChange([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    onParticipantsChange(participants.filter((p) => p.id !== id));
  };

  const updateParticipant = (
    id: string,
    field: keyof Participant,
    value: string,
  ) => {
    onParticipantsChange(
      participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  };

  const handleBookingTypeChange = (type: "individual" | "group") => {
    setBookingType(type);
    if (type === "individual" && participants.length === 0) {
      addParticipant();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participant Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Booking Type Selection */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant={bookingType === "individual" ? "default" : "outline"}
            onClick={() => handleBookingTypeChange("individual")}
            className="flex-1 gap-2"
          >
            <User className="h-4 w-4" />
            Individual
          </Button>
          <Button
            type="button"
            variant={bookingType === "group" ? "default" : "outline"}
            onClick={() => handleBookingTypeChange("group")}
            className="flex-1 gap-2"
          >
            <Users className="h-4 w-4" />
            Group
          </Button>
        </div>

        {/* Participant Forms */}
        {participants.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">No participants added yet</p>
            <Button
              type="button"
              onClick={addParticipant}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Participant
            </Button>
          </div>
        )}

        {participants.map((participant, index) => (
          <div key={participant.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">
                Participant {index + 1}
                {index === 0 && bookingType === "group" && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Group Leader)
                  </span>
                )}
              </h4>
              {(bookingType === "group" || participants.length > 1) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParticipant(participant.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Full Name *
                </label>
                <Input
                  placeholder="John Doe"
                  value={participant.name}
                  onChange={(e) =>
                    updateParticipant(participant.id, "name", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={participant.email}
                  onChange={(e) =>
                    updateParticipant(participant.id, "email", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Phone *
                </label>
                <Input
                  type="tel"
                  placeholder="+60 12-345 6789"
                  value={participant.phone}
                  onChange={(e) =>
                    updateParticipant(participant.id, "phone", e.target.value)
                  }
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Age *</label>
                <Input
                  type="number"
                  placeholder="25"
                  value={participant.age}
                  onChange={(e) =>
                    updateParticipant(participant.id, "age", e.target.value)
                  }
                  required
                  min="1"
                  max="120"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1 block">
                  Emergency Contact *
                </label>
                <Input
                  placeholder="Name and phone number"
                  value={participant.emergencyContact}
                  onChange={(e) =>
                    updateParticipant(
                      participant.id,
                      "emergencyContact",
                      e.target.value,
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add More Button for Group */}
        {bookingType === "group" && participants.length > 0 && (
          <Button
            type="button"
            onClick={addParticipant}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Participant
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
