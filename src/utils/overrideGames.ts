// The purpose of this file is to provide a way to override the data we fetch from the API
// This is useful for things like adding scores or for cancelling games that haven't yet
// been removed the sources of truth.

import { format } from "date-fns";
import { Game } from "../types.ts";

export function overrideGames(games: Game[]): Game[] {
    return games.map(game => {
        if (game.team === "Big Fat Nerds" && format(game.eventStartTime, 'M/d/yyyy') === "5/7/2025") {
            return {
                ...game,
                score: "1-2",
            }
        } 
        if (game.team === "Big Fat Nerds" && format(game.eventStartTime, 'M/d/yyyy') === "5/14/2025") {
            return {
                ...game,
                score: "3-1",
            }
        } 
        if (game.team === "Big Fat Nerds" && format(game.eventStartTime, 'M/d/yyyy') === "5/28/2025") {
            return {
                ...game,
                score: "3-3",
            }
        } 
        return game;
    });
}

