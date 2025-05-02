import { render } from 'preact';
import { signal, computed, Signal } from '@preact/signals';
import { Fretboard } from './components/Fretboard';
import { QueryInput, QueryInputExperimental } from './components/QueryInput';
import { parseQuery } from './utils/queryParser';
import { parseQuery as parseQueryExperimental } from './utils/experimental/queryParser';
import { executeQuery as executeQueryExperimental } from './utils/experimental/queryExecutor';
import { getScaleDegrees } from './utils/scales';
import { getNote } from './utils/notes';
import { generateNotes } from './utils/experimental/notes';
import { HIGHLIGHT_COLORS, numOfFrets } from './constants';

console.log('Guitar app starting...');
const useExperimental = document.location.search.includes('exp');
console.log('useExperimental:', useExperimental);

type Marker = {
  note: string;
  fret: number;
  string: string;
  label: string; // TODO: This should probably be tacked on later...
  color: string | null;
};

// Main app logic
const query = signal('');
let markers: Signal<Marker[]> = [];

if (useExperimental) {
  markers = computed(() => {
    try {
      if (!query.value) return [];
      const querySteps = parseQueryExperimental(query.value);
      const allNotes = generateNotes(numOfFrets);
      const filteredNotes = executeQueryExperimental(allNotes, querySteps);
      const allMarkers = filteredNotes.map(n => ({
        note: n.note,
        fret: n.fret,
        string: n.string,
        label: n.note,
        color: n.color || null
      }));
      return allMarkers;
    } catch (e) {
      console.error('Error processing query:', e);
      return [];
    }
  });
} else {
  markers = computed(() => {
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
}

console.log('Creating app...');

const app = (
  <>
    <Fretboard highlights={markers} />
    {useExperimental ? <QueryInputExperimental onQueryChange={(q) => query.value = q} /> : <QueryInput onQueryChange={(q) => query.value = q} />}
    <div>
      <button onClick={() => {
        // Temporary hack to toggle experimental query input
        const newUrl = new URL(window.location.href);
        if (newUrl.searchParams.get('exp')) {
          newUrl.searchParams.delete('exp');
        } else {
          newUrl.searchParams.set('exp', 'true');
        }
        window.history.pushState({}, '', newUrl);
        window.location.reload();
      }}>Toggle Experimental</button>
    </div>
  </>
);

console.log('Rendering app...');
const container = document.getElementById('guitar-app');
if (!container) throw new Error('Could not find guitar-app element');
render(app, container);
console.log('App rendered'); 