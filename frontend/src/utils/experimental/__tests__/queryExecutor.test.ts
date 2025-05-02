import { describe, it, expect } from 'vitest';
import { parseQuery } from '../queryParser';
import { executeQuery, Note } from '../queryExecutor';

describe('executeQuery', () => {
  const notes: Note[] = [
    { note: 'C', fret: 3, string: 'A', color: null },
    { note: 'D', fret: 5, string: 'A', color: null },
    { note: 'E', fret: 7, string: 'A', color: null },
    { note: 'F', fret: 8, string: 'A', color: null },
    { note: 'G', fret: 10, string: 'A', color: null },
    { note: 'A', fret: 12, string: 'A', color: null },
    { note: 'B', fret: 14, string: 'A', color: null },
    { note: 'G', fret: 3, string: 'E', color: null },
    { note: 'G', fret: 3, string: 'e', color: null },
  ];

  it('filters notes through keyOf and onFrets', () => {
    const query = 'notes | keyOf C | onFrets 5,7,8';
    const steps = parseQuery(query);
    const result = executeQuery(notes, steps);

    expect(result).toEqual([
      { note: 'D', fret: 5, string: 'A' },
      { note: 'E', fret: 7, string: 'A' },
      { note: 'F', fret: 8, string: 'A' },
    ]);
  });

  it('supports not operator', () => {
    const query = 'notes | keyOf C | not keyOf C';
    const steps = parseQuery(query);
    const result = executeQuery(notes, steps);

    expect(result).toEqual([]); // because we exclude everything that was in C major
  });

  it('supports onStrings', () => {
    const query = 'notes | onStrings e,E';
    const steps = parseQuery(query);
    const result = executeQuery(notes, steps);

    expect(result).toEqual([
      { note: 'G', fret: 3, string: 'E' },
      { note: 'G', fret: 3, string: 'e' },
    ]);
  });

  it('supports color', () => {
    const query = 'notes | keyOf C | color C,red';
    const steps = parseQuery(query);
    const result = executeQuery(notes, steps);

    expect(result).toEqual([
      { note: 'C', fret: 3, string: 'A', color: 'red' },
      { note: 'D', fret: 5, string: 'A' },
      { note: 'E', fret: 7, string: 'A' },
      { note: 'F', fret: 8, string: 'A' },
      { note: 'G', fret: 10, string: 'A' },
      { note: 'A', fret: 12, string: 'A' },
      { note: 'B', fret: 14, string: 'A' },
      { note: 'G', fret: 3, string: 'E' },
      { note: 'G', fret: 3, string: 'e' },
    ]);
  });

  it('supports color with * selector', () => {
    const query = 'notes | keyOf C | color *,green';
    const steps = parseQuery(query);
    const result = executeQuery(notes, steps);

    expect(result).toEqual([
      { note: 'C', fret: 3, string: 'A', color: 'green' },
      { note: 'D', fret: 5, string: 'A', color: 'green' },
      { note: 'E', fret: 7, string: 'A', color: 'green' },
      { note: 'F', fret: 8, string: 'A', color: 'green' },
      { note: 'G', fret: 10, string: 'A', color: 'green' },
      { note: 'A', fret: 12, string: 'A', color: 'green' },
      { note: 'B', fret: 14, string: 'A', color: 'green' },
      { note: 'G', fret: 3, string: 'E', color: 'green' },
      { note: 'G', fret: 3, string: 'e', color: 'green' },
    ]);
  });

  it('throws an error if the handler is not found', () => {
    const query = 'notes | isReallyCool';
    const steps = parseQuery(query);
    expect(() => executeQuery(notes, steps)).toThrow('Unknown filter: isReallyCool');
  });
});
