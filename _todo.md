# TODO List

## High Priority
- [ ] Clean up CSS, especially on the sports page, it's a mess and half styles are in the file and half are in styles.css. Maybe just use Tailwind?
- [ ] @guitar: Update page layout to take up the whole screen, make sure fretboard is scalable and resizes with viewport
- [ ] @guitar: Add a "scale" mode to the guitar app, where you can select a scale and see the positions of the notes on the fretboard.

## Medium Priority
- [ ] @guitar: Add a "without" filter for notes/degrees
- [ ] @guitar: Natural language input ("overlay C minor pentatonic with these chords") -- translate to the existing transform pipeline via an LLM call. Pentatonic + multi-fretboard are both done now, so this is unblocked whenever we want it.
- [ ] @guitar: Vertical fretboard orientation, not just horizontal (low priority)

## Low Priority

## Completed
- [x] @guitar: Add "pentatonic of" filter (root + major/minor -> the 5-note pentatonic scale). Shares the same notesFromIntervals helper as getKey/getChordTones now (was 3 near-identical "root + intervals -> note names" implementations before this, worth consolidating once there were that many). Verified against the well-known A minor pentatonic (A,C,D,E,G) and C major pentatonic (C,D,E,G,A).
- [x] @guitar: Support multiple fretboards on screen dynamically. Split main.tsx into a thin bootstrap + App.tsx holding a list of independent board signals (each with its own transforms, reusing QueryInput/Fretboard unchanged per board). URL state (?state=) now holds one Transform[] per board, with a compatibility path for pre-multi-fretboard links (a bare Transform[] is treated as a single board). Verified with real render+click DOM tests (preact/test-utils, already bundled with preact -- no new dependency), including a regression test for a real risk this design has: QueryInput mutates transform objects in place, so a new board's default filters must be deep-cloned or two boards would silently edit each other's state.
- [x] @guitar: Add a "chord" mode -- covered by the "chord of" filter (root + major/minor -> root/3rd/5th positions).
- [x] @guitar: Removed the CAGED shape filter entirely -- "chord of" combined with "between frets" covers the same need (a chord's tones within a chosen neck region) without a separate CAGED-specific concept to maintain/explain. Also dropped the "practical CAGED" idea, no longer needed.
- [x] @guitar: Encode all displayed state in the URL (?state=<base64 JSON of the transforms array>), synced on every change via a signals effect(), using history.replaceState so routine filter tweaks don't spam the back button. Falls back to the default setup if the param is missing or doesn't decode into something valid (old/corrupted/foreign links).
- [x] @guitar: Add "chord of" filter (root + major/minor -> every root/3rd/5th on the whole neck). Originally going to add an "all shapes" option to CAGED specifically for seeing how the 5 shapes connect, but that's redundant with this -- verified the two are nearly identical (all-5-shapes-union only misses the highest-octave repeat near fret 12-16 that a plain interval filter also happens to catch), and this is simpler/more general.
- [x] @guitar: Add CAGED shape filter (root + shape -> chord-tone positions: root/3rd/5th, with the standard doubled tones). First attempt modeled shapes as wide scale-box fret-windows, which was wrong -- CAGED means the actual open chord shapes moved up the neck, just a handful of chord tones, not a scale region. Rebuilt around the real open-chord fingerings (verified against x32010/x02220/320003/022100/xx0232) once that was clarified.
- [x] Add favicon -- cropped from the homepage avatar (static/vector_me.png)
- [x] Switched off Deno/Lume to Node + Eleventy -- pages live under src/pages with no explicit per-file exclusion needed (was the "subdir for lume pages" ask)
- [x] Need to invalidate stylesheet on deploy (should I invalidate everything? in the cloudfront cache?)
- [x] Better mobile styling
- [x] Make lume ignore infra folder
- [x] Basic guitar fretboard app
- [x] Benchapp import tool
- [x] @guitar: Add better dynamic styling for guitar app. Currently it's hard-coded, it should be dynamic based on viewport size etc.
- [x] @guitar: Add styling of highlights (i.e. color root note differently)
- [x] @guitar: Add a "note" mode to the guitar app, where you can select a note and see every position of that note on the fretboard.
- [x] @guitar: Had a cool idea...what if you can "query" the fretboard and it shows results based on the query. For example you could do something like: "A major scale, frets 3-5", or "A major scale, 1, 2, 3, 5, 6" to get the pentatonic scale. I would need to write a parser to express this and translate it into filters on the javascript side. Also need to think about what the query language should look like (i.e. just use SQL? Or something more basic and straight-forward like a DSL?)
- [x] @hockey: Updated page to have a calendar view at the top
- [x] @guitar Use form controls for filtering/mapping for simplicity
- [x] Icons or some way to distinguish between Ice Pack and Druckerman games
- [x] @guitar: Add degree labels and coloring by degree
- [x] @sports: Think about how to exclude certain games (might be worth just having a "filter" file that gets the list of games passed in and can run whatever logic it wants)

## Notes
- Use [ ] for incomplete tasks
- Use [x] for completed tasks
- Add dates when tasks are completed
- Add @tags for context (e.g., @work, @personal)
- Add ! for priority levels (!!! = high, !! = medium, ! = low)
