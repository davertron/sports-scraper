interface ScaleQuery {
  type: 'scale';
  note: string;
  scaleType: 'major' | 'minor';
  excludedDegrees: number[];
  fretRange: { start: number; end: number } | null;
  strings: string[] | null;
}

export function parseQuery(query: string): ScaleQuery[] {
  const normalized = query.toLowerCase().trim();
  console.log('Parsing query:', normalized);
  
  // Split into individual commands, being careful not to split on 'and' within other parts
  const commands = [];
  let currentCommand = '';
  let inStringList = false;
  let inWithoutList = false;
  
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const nextChars = normalized.slice(i, i + 4);
    
    // Only split on ' and' if we're not in a string list or without list
    if (nextChars === ' and' && !inStringList && !inWithoutList) {
      commands.push(currentCommand.trim());
      currentCommand = '';
      i += 3; // Skip the ' and'
      continue;
    }
    
    // Track if we're in a string list or without list
    if (normalized.slice(i, i + 7) === 'strings') inStringList = true;
    if (normalized.slice(i, i + 7) === 'without') inWithoutList = true;
    
    // End string list when we hit the next command
    if (nextChars === ' and' && inStringList) inStringList = false;
    if (nextChars === ' and' && inWithoutList) inWithoutList = false;
    
    currentCommand += char;
  }
  
  if (currentCommand.trim()) {
    commands.push(currentCommand.trim());
  }
  
  console.log('Split commands:', commands);
  
  return commands.map(cmd => {
    console.log('Processing command:', cmd);
    
    // First match the basic pattern: show [note] [scale]
    const basicMatch = cmd.match(/(?:show\s+)?([a-g]#?)\s+(major|minor)/i);
    console.log('Basic match:', basicMatch);
    
    if (!basicMatch) {
      throw new Error('Invalid query format. Try: "show c major" or "show a minor without 4th and 7th between frets 5-8 on strings E and A"');
    }
    
    // Parse the basic components
    const [_, note, scaleType] = basicMatch;
    console.log('Basic components:', { note, scaleType });
    
    // Look for optional components
    const withoutMatch = cmd.match(/without\s+((?:\d+(?:th|st|nd|rd)?(?:\s+and\s+\d+(?:th|st|nd|rd)?)*))/i);
    console.log('Without match:', withoutMatch);
    
    const fretMatch = cmd.match(/between\s+frets\s+(\d+)-(\d+)/i);
    console.log('Fret match:', fretMatch);
    
    const stringsMatch = cmd.match(/on\s+strings\s+((?:[a-ge](?:\s+and\s+[a-ge])*))/i);
    console.log('Strings match:', stringsMatch);
    
    return {
      type: 'scale',
      note: note.toUpperCase(),
      scaleType: scaleType as 'major' | 'minor',
      excludedDegrees: withoutMatch ? withoutMatch[1].split(/\s+and\s+/).map(d => parseInt(d.replace(/th|st|nd|rd/, ''))) : [],
      fretRange: fretMatch ? { start: parseInt(fretMatch[1]), end: parseInt(fretMatch[2]) } : null,
      strings: stringsMatch ? stringsMatch[1].split(/\s+and\s+/).map(s => s.trim().toUpperCase()) : null
    };
  });
} 