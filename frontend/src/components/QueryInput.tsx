import { useState } from 'preact/hooks';

interface QueryInputProps {
  onQueryChange: (query: string) => void;
}

export function QueryInput({ onQueryChange }: QueryInputProps) {
  const [queryText, setQueryText] = useState('');
  const [error, setError] = useState('');

  const exampleQueries = [
    'show c major',
    'show c major without 4th and 7th',
    'show c major between frets 5-8',
    'show c major on strings E and A',
    'show c major without 4th and 7th between frets 5-8 on strings E and A'
  ];

  const handleSubmit = () => {
    try {
      onQueryChange(queryText);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    }
  };

  return (
    <div style="margin-bottom: 20px">
      <div style="margin-bottom: 10px">
        <label style="display: block; margin-bottom: 5px">Query</label>
        <div style="display: flex; gap: 10px">
          <input
            type="text"
            value={queryText}
            placeholder="show c major without 4th and 7th between frets 5-8 on strings E and A"
            style="width: 600px; padding: 8px; font-size: 16px"
            onInput={(e) => {
              setQueryText(e.currentTarget.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <button
            style="padding: 8px 16px; font-size: 16px"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
      {error && <div style="color: red; margin-bottom: 10px">{error}</div>}
      <div style="margin-top: 20px">
        <div style="margin-bottom: 5px">Example queries:</div>
        <div style="display: flex; flex-direction: column; gap: 5px">
          {exampleQueries.map(q => (
            <button
              key={q}
              style="text-align: left; padding: 5px; background: none; border: none; color: blue; cursor: pointer"
              onClick={() => {
                setQueryText(q);
                setError('');
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 

export function QueryInputExperimental({ onQueryChange }: QueryInputProps) {
  const [queryText, setQueryText] = useState('');
  const [error, setError] = useState('');

  const exampleQueries = [
    'notes | keyOf C',
    'notes | keyOf C | onFrets 5,6,7,8',
    'notes | keyOf C | onFrets 5,6,7,8 | not isScaleDegree C 4,7',
    'notes | keyOf C | onFrets 5-8 | onStrings E,A',
    'notes | keyOf C | onFrets 5-8 | onStrings G,B,e',
    'notes | keyOf C | color C,green'
  ];

  const handleSubmit = () => {
    try {
      onQueryChange(queryText);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    }
  };

  return (
    <div style="margin-bottom: 20px">
      <div style="margin-bottom: 10px">
        <label style="display: block; margin-bottom: 5px">Query</label>
        <div style="display: flex; gap: 10px">
          <input
            type="text"
            value={queryText}
            placeholder="notes | keyOf C | onFrets 5,6,7,8 | onStrings E,A"
            style="width: 600px; padding: 8px; font-size: 16px"
            onInput={(e) => {
              setQueryText(e.currentTarget.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
          />
          <button
            style="padding: 8px 16px; font-size: 16px"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
      {error && <div style="color: red; margin-bottom: 10px">{error}</div>}
      <div style="margin-top: 20px">
        <div style="margin-bottom: 5px">Example queries:</div>
        <div style="display: flex; flex-direction: column; gap: 5px">
          {exampleQueries.map(q => (
            <button
              key={q}
              style="text-align: left; padding: 5px; background: none; border: none; color: blue; cursor: pointer"
              onClick={() => {
                setQueryText(q);
                setError('');
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 