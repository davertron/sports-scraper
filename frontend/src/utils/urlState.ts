import { Transform } from "./transforms";

const URL_PARAM = "state";

function isTransformArray(value: unknown): value is Transform[] {
  return (
    Array.isArray(value) &&
    value.every(
      (t) =>
        t &&
        typeof t === "object" &&
        (t.type === "filter" || t.type === "map") &&
        Array.isArray(t.args)
    )
  );
}

function isBoardsArray(value: unknown): value is Transform[][] {
  return Array.isArray(value) && value.every(isTransformArray);
}

// Reads the ?state= param from the given URL (defaults to the current page)
// and decodes it back into one Transform[] per fretboard, or null if
// there's no state param or it doesn't decode into something usable
// (missing param, corrupted base64, invalid JSON, or JSON that isn't
// actually shaped like this -- e.g. a link from an incompatible version of
// this app). Also accepts links saved before multi-fretboard support
// existed, when ?state= held a single Transform[] rather than a list of
// them -- those are treated as a single board.
export function loadBoardsFromUrl(url: string = window.location.href): Transform[][] | null {
  try {
    const encoded = new URL(url).searchParams.get(URL_PARAM);
    if (!encoded) {
      return null;
    }
    const parsed = JSON.parse(atob(encoded));
    if (isBoardsArray(parsed)) {
      return parsed;
    }
    if (isTransformArray(parsed)) {
      return [parsed]; // pre-multi-fretboard link
    }
    return null;
  } catch {
    return null;
  }
}

export function encodeBoardsForUrl(boards: Transform[][]): string {
  return btoa(JSON.stringify(boards));
}

// Updates the current page's URL to reflect the given fretboards, without
// adding a new browser history entry -- every filter tweak shouldn't pile
// up on the back button, this is for sharing/bookmarking the current state.
export function syncBoardsToUrl(boards: Transform[][]): void {
  const url = new URL(window.location.href);
  url.searchParams.set(URL_PARAM, encodeBoardsForUrl(boards));
  window.history.replaceState(null, "", url.toString());
}
