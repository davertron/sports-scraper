import { render } from 'preact';
import { signal, computed, Signal } from '@preact/signals';
import { Fretboard } from './components/Fretboard';
import { QueryInput } from './components/QueryInput';
import { generateNotes } from './utils/notes';
import { applyTransforms, Transform } from './utils/transforms';

console.log('Guitar app starting...');

// Main app logic
const transforms = signal<Transform[]>([
  {type: 'filter', args: ['key-of', 'C']}, 
  {type: 'filter', args: ['between-frets', '5-8']}, 
  // {type: 'filter', args: ['on-strings', ['E', 'A', 'e']]}, 
  // {type: 'map', args: ['color-notes', ['C'], 'teal']}
]);
let markers = computed(() => {
  try {
    const notes = generateNotes(16);
    const allMarkers = applyTransforms(notes, transforms.value).map(n => ({
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
    <QueryInput transforms={transforms} />
  </>
);

console.log('Rendering app...');
const container = document.getElementById('guitar-app');
if (!container) throw new Error('Could not find guitar-app element');
render(app, container);
console.log('App rendered'); 