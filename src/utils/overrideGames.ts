// The purpose of this file is to provide a way to override the data we fetch from the API
// This is useful for things like adding scores or for cancelling games that haven't yet
// been removed the sources of truth.

import type { Game } from "../types.ts";

// Matches date-fns' format(date, 'M/d/yyyy'), which formats in the local
// (system) timezone -- kept as-is here since these overrides just need to
// match a specific calendar day, not a precise instant.
function formatMDYYYY(timestampMs: number): string {
    const date = new Date(timestampMs);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function overrideGames(games: Game[]): Game[] {
    return games.map(game => {
        if (game.team === "Big Fat Nerds" && formatMDYYYY(game.eventStartTime) === "5/7/2025") {
            return {
                ...game,
                score: "1-2",
            }
        }
        if (game.team === "Big Fat Nerds" && formatMDYYYY(game.eventStartTime) === "5/14/2025") {
            return {
                ...game,
                score: "3-1",
            }
        }
        if (game.team === "Big Fat Nerds" && formatMDYYYY(game.eventStartTime) === "5/28/2025") {
            return {
                ...game,
                score: "3-3",
            }
        }
        return game;
    });
}

