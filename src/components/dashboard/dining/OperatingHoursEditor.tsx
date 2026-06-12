"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Copy, Trash2, Clock, AlertCircle } from "lucide-react";

// Types
export interface TimeSlot {
  open: string;
  close: string;
}

export interface DaySchedule {
  day: string;
  isClosed: boolean;
  is24Hours: boolean;
  slots: TimeSlot[];
}

export type WeeklySchedule = DaySchedule[];

const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "Monday", short: "Mon" },
  { key: "TUESDAY", label: "Tuesday", short: "Tue" },
  { key: "WEDNESDAY", label: "Wednesday", short: "Wed" },
  { key: "THURSDAY", label: "Thursday", short: "Thu" },
  { key: "FRIDAY", label: "Friday", short: "Fri" },
  { key: "SATURDAY", label: "Saturday", short: "Sat" },
  { key: "SUNDAY", label: "Sunday", short: "Sun" },
];

const DEFAULT_SLOT: TimeSlot = { open: "09:00", close: "22:00" };

const createEmptySchedule = (): WeeklySchedule =>
  DAYS_OF_WEEK.map(day => ({
    day: day.key,
    isClosed: false,
    is24Hours: false,
    slots: [{ ...DEFAULT_SLOT }],
  }));

interface OperatingHoursEditorProps {
  value: WeeklySchedule | null;
  onChange: (schedule: WeeklySchedule) => void;
}

export function OperatingHoursEditor({ value, onChange }: OperatingHoursEditorProps) {
  const [schedule, setSchedule] = useState<WeeklySchedule>(
    value || createEmptySchedule()
  );

  // Sync incoming value changes during render to avoid useEffect set-state warning.
  // This pattern is recommended by the React docs for syncing state to props
  // when the state still needs to be edited locally.
  const [prevValue, setPrevValue] = useState<WeeklySchedule | null>(value);
  if (value !== prevValue) {
    setSchedule(value || createEmptySchedule());
    setPrevValue(value);
  }

  const updateDay = (dayIndex: number, updates: Partial<DaySchedule>) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], ...updates };
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const updateSlot = (dayIndex: number, slotIndex: number, updates: Partial<TimeSlot>) => {
    const newSchedule = [...schedule];
    const newSlots = [...newSchedule[dayIndex].slots];
    newSlots[slotIndex] = { ...newSlots[slotIndex], ...updates };
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], slots: newSlots };
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const addSlot = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.push({ open: "12:00", close: "14:00" });
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].slots.splice(slotIndex, 1);
    if (newSchedule[dayIndex].slots.length === 0) {
      newSchedule[dayIndex].slots.push({ ...DEFAULT_SLOT });
    }
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  // Quick actions
  const copyMondayToWeekdays = () => {
    const monday = schedule[0];
    const newSchedule = schedule.map((day, index) => {
      if (index >= 1 && index <= 4) { // Tue-Fri
        return {
          ...day,
          isClosed: monday.isClosed,
          is24Hours: monday.is24Hours,
          slots: monday.slots.map(s => ({ ...s })),
        };
      }
      return day;
    });
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const setSameHoursForAll = () => {
    const monday = schedule[0];
    const newSchedule = schedule.map(day => ({
      ...day,
      isClosed: monday.isClosed,
      is24Hours: monday.is24Hours,
      slots: monday.slots.map(s => ({ ...s })),
    }));
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const setAllClosed = () => {
    const newSchedule = schedule.map(day => ({
      ...day,
      isClosed: true,
      is24Hours: false,
      slots: [],
    }));
    setSchedule(newSchedule);
    onChange(newSchedule);
  };

  const validateSlot = (slot: TimeSlot): boolean => {
    if (!slot.open || !slot.close) return false;
    return slot.open < slot.close;
  };

  const getDayLabel = (dayKey: string): string => {
    return DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyMondayToWeekdays}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy Mon → Weekdays
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setSameHoursForAll}
          >
            Same for All Days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setAllClosed}
          >
            Set All Closed
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((day, dayIndex) => (
          <div
            key={day.day}
            className={`p-3 rounded-lg border ${day.isClosed ? 'bg-muted/50' : 'bg-background'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Label className="font-medium w-24">{getDayLabel(day.day)}</Label>

              <div className="flex items-center gap-4">
                {/* Closed Toggle */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground">Closed</Label>
                  <Switch
                    checked={day.isClosed}
                    onCheckedChange={(checked) => {
                      updateDay(dayIndex, {
                        isClosed: checked,
                        is24Hours: false,
                        slots: checked ? [] : [{ ...DEFAULT_SLOT }]
                      });
                    }}
                  />
                </div>

                {/* 24 Hours Toggle */}
                {!day.isClosed && (
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">24 Hours</Label>
                    <Switch
                      checked={day.is24Hours}
                      onCheckedChange={(checked) => {
                        updateDay(dayIndex, {
                          is24Hours: checked,
                          slots: checked ? [] : [{ ...DEFAULT_SLOT }]
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Time Slots */}
            {!day.isClosed && !day.is24Hours && (
              <div className="space-y-2 ml-0 md:ml-24">
                {day.slots.map((slot, slotIndex) => {
                  const isInvalid = !validateSlot(slot);
                  return (
                    <div key={slotIndex} className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.open}
                          onChange={(e) => updateSlot(dayIndex, slotIndex, { open: e.target.value })}
                          className="px-2 py-1 border rounded text-sm w-28"
                        />
                        <span className="text-muted-foreground">to</span>
                        <input
                          type="time"
                          value={slot.close}
                          onChange={(e) => updateSlot(dayIndex, slotIndex, { close: e.target.value })}
                          className="px-2 py-1 border rounded text-sm w-28"
                        />
                      </div>

                      {day.slots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSlot(dayIndex, slotIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      {isInvalid && (
                        <span className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Invalid time range
                        </span>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addSlot(dayIndex)}
                  className="text-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add time slot
                </Button>
              </div>
            )}

            {day.isClosed && (
              <div className="text-sm text-muted-foreground ml-0 md:ml-24">
                Closed this day
              </div>
            )}

            {day.is24Hours && (
              <div className="text-sm text-green-600 ml-0 md:ml-24">
                Open 24 hours
              </div>
            )}
          </div>
        ))}

        <p className="text-xs text-muted-foreground mt-4">
          <AlertCircle className="h-3 w-3 inline mr-1" />
          Operating hours are optional. You can publish without setting hours.
        </p>
      </CardContent>
    </Card>
  );
}

// Helper function to convert schedule to human-readable string
export function scheduleToHumanReadable(schedule: WeeklySchedule | null): string {
  if (!schedule || schedule.length === 0) return "Hours not set";

  const parts: string[] = [];
  for (const day of schedule) {
    const dayLabel = DAYS_OF_WEEK.find(d => d.key === day.day)?.short || day.day;
    if (day.isClosed) {
      parts.push(`${dayLabel}: Closed`);
    } else if (day.is24Hours) {
      parts.push(`${dayLabel}: 24 Hours`);
    } else if (day.slots.length > 0) {
      const times = day.slots.map(s => `${formatTime(s.open)} - ${formatTime(s.close)}`).join(", ");
      parts.push(`${dayLabel}: ${times}`);
    }
  }

  return parts.join(" | ");
}

// Format time from 24h to 12h display
export function formatTime(time: string): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

// Export the type for external use
export { DAYS_OF_WEEK };

