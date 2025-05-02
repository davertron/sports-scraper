import { describe, it, expect } from 'vitest';
import { parseQuery } from '../queryParser';

describe('parseQuery', () => {
  it('parses a basic pipeline', () => {
    const query = 'notes | keyOf C | onFrets 3,4,5,6,7,8 | not isScaleDegree C 4,7';
    const result = parseQuery(query);

    expect(result).toEqual([
      { type: 'keyOf', args: ['C'] },
      { type: 'onFrets', args: ['3', '4', '5', '6', '7', '8'] },
      { type: 'not', args: ['isScaleDegree', 'C', '4', '7'] },
    ]);
  });

  it('parses a basic pipeline with a single step', () => {
    const query = 'notes | keyOf C';
    const result = parseQuery(query);

    expect(result).toEqual([
      { type: 'keyOf', args: ['C'] }, 
    ]);
  });

  it('parses fret range correctly', () => {
    const query = 'notes | onFrets 5-8';
    const result = parseQuery(query);

    expect(result).toEqual([
      { type: 'onFrets', args: ['5', '6', '7', '8'] },
    ]);
  });

  it('parses fret range mixed with single frets correctly', () => {
    const query = 'notes | onFrets 5-8,10,11-13';
    const result = parseQuery(query);

    expect(result).toEqual([
      { type: 'onFrets', args: ['5', '6', '7', '8', '10', '11', '12', '13'] },
    ]);
  });

  it('parses both e strings properly', () => {
    const query = 'notes | onStrings e,E';
    const result = parseQuery(query);

    expect(result).toEqual([
      { type: 'onStrings', args: ['e', 'E'] },
    ]);
  });

  it('throws if the query does not start with notes', () => {
    expect(() => parseQuery('foo | keyOf C')).toThrow("Query must start with 'notes'");
  });

  it('parses a single step correctly', () => {
    const query = 'notes | keyOf G';
    const result = parseQuery(query);

    expect(result).toEqual([
      { type: 'keyOf', args: ['G'] },
    ]);
  });

  it('parses a query with color correctly', () => {
    const query = 'notes | keyOf C | color C,red';
    const result = parseQuery(query);

    expect(result).toEqual([
      { type: 'keyOf', args: ['C'] },
      { type: 'color', args: ['C', 'red'] },
    ]);
  });
});