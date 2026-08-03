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

// Reads the ?state= param from the given URL (defaults to the current page)
// and decodes it back into a Transform[], or null if there's no state param
// or it doesn't decode into something usable (missing param, corrupted
// base64, invalid JSON, or JSON that isn't actually a Transform[] -- e.g. an
// old link from a future version of this app with a different shape).
export function loadTransformsFromUrl(url: string = window.location.href): Transform[] | null {
  try {
    const encoded = new URL(url).searchParams.get(URL_PARAM);
    if (!encoded) {
      return null;
    }
    const parsed = JSON.parse(atob(encoded));
    return isTransformArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function encodeTransformsForUrl(transforms: Transform[]): string {
  return btoa(JSON.stringify(transforms));
}

// Updates the current page's URL to reflect the given transforms, without
// adding a new browser history entry -- every filter tweak shouldn't pile
// up on the back button, this is for sharing/bookmarking the current state.
export function syncTransformsToUrl(transforms: Transform[]): void {
  const url = new URL(window.location.href);
  url.searchParams.set(URL_PARAM, encodeTransformsForUrl(transforms));
  window.history.replaceState(null, "", url.toString());
}
