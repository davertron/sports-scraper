# TODO List

## High Priority
- [ ] @guitar: Update page layout to take up the whole screen, make sure fretboard is scalable and resizes with viewport
- [ ] @guitar: Add "interval" label to highlights for scales
- [ ] @guitar: Add a "scale" mode to the guitar app, where you can select a scale and see the positions of the notes on the fretboard.
- [ ] @guitar: Add a "chord" mode to the guitar app, where you can select a chord and see the positions of the notes on the fretboard.

## Medium Priority
- [ ] Look into a subdir for lume pages, so we don't have to worry about explicitly excluding new files all the time.

## Low Priority
- [ ] Add favicon

## Completed
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

## Notes
- Use [ ] for incomplete tasks
- Use [x] for completed tasks
- Add dates when tasks are completed
- Add @tags for context (e.g., @work, @personal)
- Add ! for priority levels (!!! = high, !! = medium, ! = low)
