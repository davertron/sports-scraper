import { signal, effect, useComputed, Signal } from '@preact/signals';
import { Fretboard } from './components/Fretboard';
import { QueryInput } from './components/QueryInput';
import { generateNotes } from './utils/notes';
import { applyTransforms, Transform } from './utils/transforms';
import { loadBoardsFromUrl, syncBoardsToUrl } from './utils/urlState';

const DEFAULT_TRANSFORMS: Transform[] = [
  {type: 'filter', args: ['key-of', 'C']},
  {type: 'filter', args: ['between-frets', '5-8']},
  {type: 'map', args: ['add-degree', 'C']}
];

export type Board = {
  id: string;
  transforms: Signal<Transform[]>;
};

// structuredClone matters here: QueryInput's update functions mutate
// Transform objects (and their .args arrays) in place rather than fully
// immutably, so two boards sharing the same underlying objects would edit
// each other's filters. Every new board needs its own independent copies.
export function makeBoard(initialTransforms?: Transform[]): Board {
  return {
    id: crypto.randomUUID(),
    transforms: signal(initialTransforms ?? structuredClone(DEFAULT_TRANSFORMS)),
  };
}

const initialBoards = loadBoardsFromUrl();
export const boards = signal<Board[]>(
  (initialBoards && initialBoards.length > 0 ? initialBoards : [structuredClone(DEFAULT_TRANSFORMS)]).map((t) =>
    makeBoard(t)
  )
);

// Keep the URL's ?state= in sync with every change to any board, so the
// current setup (however many boards, whatever filters) is always
// bookmarkable/shareable as-is.
effect(() => {
  syncBoardsToUrl(boards.value.map((b) => b.transforms.value));
});

export function addBoard() {
  boards.value = [...boards.value, makeBoard()];
}

export function removeBoard(id: string) {
  boards.value = boards.value.filter((b) => b.id !== id);
}

function FretboardPanel({ board }: { board: Board }) {
  const markers = useComputed(() => {
    try {
      const notes = generateNotes(16);
      return applyTransforms(notes, board.transforms.value).map(n => ({
        ...n,
        label: n.note,
        color: n.color || null,
      }));
    } catch (e) {
      console.error('Error processing query:', e);
      return [];
    }
  });

  return (
    <div class="fretboard-panel" style={{ marginBottom: '2em', paddingBottom: '2em', borderBottom: '1px solid #ccc' }}>
      <Fretboard highlights={markers} />
      <QueryInput transforms={board.transforms} />
      <button onClick={() => removeBoard(board.id)}>Remove this fretboard</button>
    </div>
  );
}

export function App() {
  return (
    <>
      {boards.value.map((board) => (
        <FretboardPanel key={board.id} board={board} />
      ))}
      <button onClick={addBoard}>Add fretboard</button>
    </>
  );
}
