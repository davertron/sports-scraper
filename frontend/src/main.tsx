import { render } from 'preact';
import { signal, computed, Signal } from '@preact/signals';
import { Fretboard } from './components/Fretboard';
import { QueryInput } from './components/QueryInput';

console.log('Guitar app starting...');

export type Note = {
  note: string;
  fret: number;
  string: string;
  color: string | null;
};

// Main app logic
const query = signal(`(filter (is-in-key "C"))
(filter (is-between-frets 5 8))
;(filter (is-on-strings ["E" "A" "e"]))
(map (color-notes ["C"] "teal"))
`);
const queryResults: Signal<Note[]> = signal([]);
let markers = computed(() => {
  try {
    if (!queryResults.value) return [];
    const allMarkers = queryResults.value.map(n => ({
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

const app = (
  <>
    <Fretboard highlights={markers} />
    <QueryInput initialQuery={query.value} onQueryChange={(r) => queryResults.value = r} />
  </>
);

console.log('Rendering app...');
const container = document.getElementById('guitar-app');
if (!container) throw new Error('Could not find guitar-app element');
render(app, container);
console.log('App rendered'); 