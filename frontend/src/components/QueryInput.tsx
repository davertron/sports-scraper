import { useState, useEffect } from 'preact/hooks';
import { Note } from '../main';
import CodeMirror, { basicSetup } from '@uiw/react-codemirror';
import { clojure } from '@nextjournal/lang-clojure';
import { vim } from "@replit/codemirror-vim"

declare const scittle: any;

interface QueryInputProps {
  initialQuery?: string;
  onQueryChange: (notes: Note[]) => void;
}

export function QueryInput({ initialQuery, onQueryChange }: QueryInputProps) {
  const [queryText, setQueryText] = useState(initialQuery || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    try {
      const wrappedQueryText = `(->> notes ${queryText} (clj->js))`;
      const result = scittle.core.eval_string(wrappedQueryText);
      onQueryChange(result);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key === 'Enter') {
        event.preventDefault();
        event.stopPropagation();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [queryText]); // Re-run effect when queryText changes
  
  return (
    <div>
      <CodeMirror 
           value={queryText} 
           height="200px" 
           extensions={[vim(), basicSetup(), clojure()]} 
           onChange={val => setQueryText(val)}  
           width="1200px"
      />
      <br/>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}