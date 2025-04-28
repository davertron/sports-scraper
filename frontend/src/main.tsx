import { h, render } from 'preact';
import { signal, computed } from '@preact/signals';
import { Fretboard } from './components/Fretboard';
import { QueryInput } from './components/QueryInput';
import { parseQuery } from './utils/queryParser';
import { getScaleDegrees } from './utils/scales';
import { getNote } from './utils/notes';
import { HIGHLIGHT_COLORS, numOfFrets } from './constants';

console.log('Guitar app starting...');

// Main app logic
const query = signal('');
const markers = computed(() => {
  if (!query.value) return [];

  try {
    const parsedQueries = parseQuery(query.value);
    const allMarkers = [];

    parsedQueries.forEach(q => {
      const scaleDegrees = getScaleDegrees(q.note, q.scaleType);
      const strings = q.strings || ['E', 'A', 'D', 'G', 'B', 'e'];
      const startFret = q.fretRange?.start || 0;
      const endFret = q.fretRange?.end || numOfFrets;

      for (let i = 0; i < strings.length; i++) {
        for (let j = startFret; j <= endFret; j++) {
          const note = getNote(j, strings[i]);
          const degree = scaleDegrees.find(d => d.note === note);
          
          if (degree && !q.excludedDegrees.includes(degree.degree)) {
            allMarkers.push({
              string: strings[i],
              fret: j,
              label: note,
              color: degree.degree === 1 ? HIGHLIGHT_COLORS.ROOT : HIGHLIGHT_COLORS.NOTE
            });
          }
        }
      }
    });

    return allMarkers;
  } catch (e) {
    console.error('Error processing query:', e);
    return [];
  }
});

console.log('Creating app...');
const app = (
  <>
    <Fretboard highlights={markers} />
    <QueryInput onQueryChange={(q) => query.value = q} />
  </>
);

console.log('Rendering app...');
render(app, document.getElementById('guitar-app'));
console.log('App rendered'); 