import { DateTime } from "https://esm.sh/luxon@3.6.1";
import { Game } from "../types.ts";

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

// Parse date from "2025-04-11T06:40:00" using luxon.DateTime
export function toUTCMillis(dateString: string) {
  const dt = DateTime.fromISO(dateString, {
    zone: "America/New_York", // interpret input as being in this zone
  });
  return dt.toMillis();
}
