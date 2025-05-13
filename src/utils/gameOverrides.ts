// The purpose of this file is to provide a way to override the data we fetch from the API
// This is useful for things like adding scores or for cancelling games that haven't yet
// been removed the sources of truth.

import { format } from "https://esm.sh/date-fns";
import { Game } from "../types.ts";

export function overrideGames(games: Game[]): Game[] {
    return games.map(game => {
        if(game.team === "Ice Pack" && game.opponent === "Team D") {
            return {
                ...game,
                cancelled: true,
            }
        }

        if (game.team === "Big Fat Nerds" && format(game.eventStartTime, 'M/d/yyyy') === "5/7/2025") {
            return {
                ...game,
                score: "2-1",
            }
        }
        return game;
    });
}

