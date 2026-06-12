"use client";

import { Clock } from "lucide-react";

interface TimeSlot {
  open: string;
  close: string;
}

interface DaySchedule {
  day: string;
  isClosed: boolean;
  is24Hours: boolean;
  slots: TimeSlot[];
}

type WeeklySchedule = DaySchedule[];

const DAYS_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function formatTime(time: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function getCurrentDay(): string {
  const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return days[new Date().getDay()];
}

interface OperatingHoursDisplayProps {
  operatingHoursJson: string | null;
  fallbackHours?: string;
  className?: string;
  showCurrentDay?: boolean;
}

export function OperatingHoursDisplay({
  operatingHoursJson,
  fallbackHours,
  className = "",
  showCurrentDay = true
}: OperatingHoursDisplayProps) {
  // Parse the JSON
  let schedule: WeeklySchedule | null = null;

  if (operatingHoursJson) {
    try {
      schedule = typeof operatingHoursJson === 'string'
        ? JSON.parse(operatingHoursJson)
        : operatingHoursJson;
    } catch (e) {
      console.error("Failed to parse operating hours:", e);
    }
  }

  // If no valid schedule, show fallback
  if (!schedule || schedule.length === 0) {
    return (
      <div className={`text-muted-foreground ${className}`}>
        {fallbackHours || "Opening hours not available"}
      </div>
    );
  }

  const currentDay = getCurrentDay();

  // Sort by day order
  const sortedSchedule = [...schedule].sort((a, b) => {
    return DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
  });

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-semibold flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-primary" />
        Opening Hours
      </h4>

      <div className="space-y-1">
        {sortedSchedule.map((day) => {
          const isToday = showCurrentDay && day.day === currentDay;

          return (
            <div
              key={day.day}
              className={`flex justify-between items-center py-1 px-2 rounded ${isToday ? 'bg-primary/10 font-medium' : ''
                }`}
            >
              <span className={`text-sm ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {DAY_LABELS[day.day] || day.day}
                {isToday && <span className="ml-1 text-xs">(Today)</span>}
              </span>

              <span className="text-sm">
                {day.isClosed ? (
                  <span className="text-red-500">Closed</span>
                ) : day.is24Hours ? (
                  <span className="text-green-600">24 Hours</span>
                ) : day.slots.length > 0 ? (
                  <span className={isToday ? 'text-primary' : ''}>
                    {day.slots.map((slot, idx) => (
                      <span key={idx}>
                        {formatTime(slot.open)} - {formatTime(slot.close)}
                        {idx < day.slots.length - 1 && ", "}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact version for cards
export function OperatingHoursCompact({
  operatingHoursJson,
  fallbackHours
}: {
  operatingHoursJson: string | null;
  fallbackHours?: string;
}) {
  let schedule: WeeklySchedule | null = null;

  if (operatingHoursJson) {
    try {
      schedule = typeof operatingHoursJson === 'string'
        ? JSON.parse(operatingHoursJson)
        : operatingHoursJson;
    } catch {
      // ignore
    }
  }

  if (!schedule || schedule.length === 0) {
    return <span className="text-muted-foreground text-sm">{fallbackHours || "Hours not set"}</span>;
  }

  const currentDay = getCurrentDay();
  const today = schedule.find(d => d.day === currentDay);

  if (!today) {
    return <span className="text-muted-foreground text-sm">{fallbackHours || "Hours not set"}</span>;
  }

  if (today.isClosed) {
    return <span className="text-red-500 text-sm">Closed today</span>;
  }

  if (today.is24Hours) {
    return <span className="text-green-600 text-sm">Open 24 hours</span>;
  }

  if (today.slots.length > 0) {
    const firstSlot = today.slots[0];
    return (
      <span className="text-sm">
        Today: {formatTime(firstSlot.open)} - {formatTime(firstSlot.close)}
        {today.slots.length > 1 && ` (+${today.slots.length - 1} more)`}
      </span>
    );
  }

  return <span className="text-muted-foreground text-sm">{fallbackHours || "Hours not set"}</span>;
}

