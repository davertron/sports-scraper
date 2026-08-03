import { render } from 'preact';
import { signal, computed, effect } from '@preact/signals';
import { Fretboard } from './components/Fretboard';
import { QueryInput } from './components/QueryInput';
import { generateNotes } from './utils/notes';
import { applyTransforms, Transform } from './utils/transforms';
import { loadTransformsFromUrl, syncTransformsToUrl } from './utils/urlState';

const DEFAULT_TRANSFORMS: Transform[] = [
  {type: 'filter', args: ['key-of', 'C']},
  {type: 'filter', args: ['between-frets', '5-8']},
  {type: 'map', args: ['add-degree', 'C']}
];

// Main app logic
const transforms = signal<Transform[]>(loadTransformsFromUrl() ?? DEFAULT_TRANSFORMS);

// Keep the URL's ?state= in sync with every change, so the current setup is
// always bookmarkable/shareable as-is.
effect(() => {
  syncTransformsToUrl(transforms.value);
});
let markers = computed(() => {
  try {
    const notes = generateNotes(16);
    return applyTransforms(notes, transforms.value).map(n => ({
      ...n,
      label: n.note,
      color: n.color || null,
    }));
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

const container = document.getElementById('guitar-app');
if (!container) throw new Error('Could not find guitar-app element');
render(app, container);
