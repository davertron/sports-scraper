import type { Game } from "../types.ts";

export function formatTime(date: Date): string {
  return date.toLocaleString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
}

export function formatDateRange(startTime: number, endTime: number): string {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const month = startDate.toLocaleString('en-US', { month: 'numeric', timeZone: 'America/New_York' });
  const day = startDate.toLocaleString('en-US', { day: 'numeric', timeZone: 'America/New_York' });
  
  return `${month}/${day} ${formatTime(startDate)} - ${formatTime(endDate)}`;
}

export function formatGameTime(game: Game): string {
  return game.team === "Druckerman" 
    ? formatDateRange(game.eventStartTime, game.eventEndTime)
    : formatTime(new Date(game.eventStartTime))
}

// Parse a local ISO-ish date string (e.g. "2025-04-11T06:40:00"), interpreting
// it as America/New_York local time, and return UTC epoch millis.
export function toUTCMillis(dateString: string): number {
  return Temporal.PlainDateTime.from(dateString)
    .toZonedDateTime("America/New_York")
    .epochMilliseconds;
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

export function monthNameToNumber(name: string): number {
  const month = MONTH_NAMES[name.toLowerCase()];
  if (!month) {
    throw new Error(`Unrecognized month name: "${name}"`);
  }
  return month;
}

// Convert a 12-hour clock hour + AM/PM marker into a 24-hour clock hour.
export function to24Hour(hour12: number, meridiem: string): number {
  const isPM = /^p/i.test(meridiem);
  const hour = hour12 % 12;
  return isPM ? hour + 12 : hour;
}

// Build UTC epoch millis from wall-clock date/time parts interpreted in the
// given IANA zone (defaults to America/New_York).
export function zonedMillis(
  parts: { year: number; month: number; day: number; hour: number; minute: number },
  timeZone = "America/New_York"
): number {
  return Temporal.ZonedDateTime.from({ ...parts, timeZone }).epochMilliseconds;
}
