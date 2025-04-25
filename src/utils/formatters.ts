import { Game } from "../types.ts";

export function formatTime(date: Date): string {
  return date.toLocaleString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/New_York'
  });
}

export function formatIcePackTime(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'numeric', timeZone: 'America/New_York' });
  const day = date.toLocaleString('en-US', { day: 'numeric', timeZone: 'America/New_York' });
  return `${month}/${day} ${formatTime(date)}`;
}

export function formatDateRange(startTime: number, endTime: number): string {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const month = startDate.toLocaleString('en-US', { month: 'numeric', timeZone: 'America/New_York' });
  const day = startDate.toLocaleString('en-US', { day: 'numeric', timeZone: 'America/New_York' });
  
  return `${month}/${day} ${formatTime(startDate)} - ${formatTime(endDate)}`;
}

export function formatIcePackGame(game?: Game): string {
  if (!game) {
    return "";
  }
  return `${game.team} vs ${game.opponent} at ${formatIcePackTime(game.eventStartTime)}, ${game.rink}`;
}

export function formatDruckermanGame(game?: Game): string {
  if (!game) {
    return "";
  }
  return `${formatDateRange(game.eventStartTime, game.eventEndTime)}, ${game.rink}`;
}

export function formatGameTime(game: Game): string {
  return game.team === "Ice Pack" 
    ? formatIcePackTime(game.eventStartTime)
    : formatDateRange(game.eventStartTime, game.eventEndTime);
}