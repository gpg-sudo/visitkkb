"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AvailabilityData {
  date: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  isBlocked: boolean;
}

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  activityId?: string; // For showing availability (UUID)
  stayId?: string; // For stays
  minDate?: Date; // Minimum selectable date
}

export function Calendar({
  selectedDate,
  onDateSelect,
  activityId,
  stayId,
  minDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, AvailabilityData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailability = useCallback(async () => {
    if (!activityId && !stayId) return;
    
    setIsLoading(true);
    try {
      const month = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const params = new URLSearchParams({ month });
      if (activityId) params.set('activityId', activityId);
      if (stayId) params.set('stayId', stayId);
      
      const response = await fetch(`/api/availability?${params}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        const availMap: Record<string, AvailabilityData> = {};
        for (const item of data.data) {
          availMap[item.date] = item;
        }
        setAvailability(availMap);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activityId, stayId, currentMonth]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const previousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    const today = new Date();
    // Don't go before current month
    if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(newMonth);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isDateInPast = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Also check against minDate if provided
    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      return date < min;
    }
    
    return date < today;
  };

  const getDateAvailability = (day: number): AvailabilityData | null => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day,
    );
    const dateString = date.toISOString().split("T")[0];
    return availability[dateString] || null;
  };

  const isPreviousMonthDisabled = () => {
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonth <= currentMonthStart;
  };

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={previousMonth}
          disabled={isPreviousMonthDisabled()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </h3>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground p-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isPast = isDateInPast(day);
          const isSelected = isDateSelected(day);
          const avail = getDateAvailability(day);
          const isFullyBooked = avail ? avail.availableSlots === 0 || avail.isBlocked : false;
          const isLowAvailability = avail
            ? avail.availableSlots <= 5 && avail.availableSlots > 0
            : false;
          const isDisabled = isPast || isFullyBooked;

          return (
            <button
              key={day}
              onClick={() => {
                if (!isDisabled) {
                  onDateSelect(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day,
                    ),
                  );
                }
              }}
              disabled={isDisabled}
              className={`
                p-2 text-sm rounded-md transition-colors relative
                ${isDisabled ? "text-muted-foreground cursor-not-allowed opacity-50" : "hover:bg-accent cursor-pointer"}
                ${isSelected ? "bg-primary text-primary-foreground font-bold" : ""}
                ${isLowAvailability && !isSelected ? "border border-orange-400" : ""}
              `}
              title={
                avail
                  ? `${avail.availableSlots}/${avail.totalSlots} spots available`
                  : isPast ? "Past date" : "Available"
              }
            >
              <div className="flex flex-col items-center">
                <span>{day}</span>
                {avail && !isPast && (activityId || stayId) && (
                  <span
                    className={`text-[10px] ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    {avail.availableSlots}/{avail.totalSlots}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {(activityId || stayId) && (
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-orange-400 rounded"></div>
            <span>Low availability (≤5 spots)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-muted rounded opacity-50"></div>
            <span>Fully booked or past date</span>
          </div>
        </div>
      )}
    </div>
  );
}
