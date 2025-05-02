export type QueryStep = {
    type: string;
    args: string[];
  };
  
export function parseQuery(input: string): QueryStep[] {
  const parts = input.split('|').map(p => p.trim());

  if (parts[0] !== 'notes') {
    throw new Error(`Query must start with 'notes'`);
  }

  const steps: QueryStep[] = [];

  for (const part of parts.slice(1)) {
    const match = part.match(/^([a-zA-Z0-9_]+)(?:\s+(.*))?$/);
    if (!match) {
      throw new Error(`Invalid step format: '${part}'`);
    }
    const [, funcName, argString] = match;

    let args: string[] = [];
    if (argString) {
      if (funcName === 'not') {
        // For 'not' operations, split on spaces first to get the nested operation
        const [nestedOp, ...restArgs] = argString.split(/\s+/);
        // Split the last argument on commas if it contains them
        const lastArg = restArgs[restArgs.length - 1];
        if (lastArg.includes(',')) {
          const [beforeLast, ...commaArgs] = lastArg.split(',');
          args = [nestedOp, ...restArgs.slice(0, -1), beforeLast, ...commaArgs].map(s => s.trim()).filter(Boolean);
        } else {
          args = [nestedOp, ...restArgs];
        }
      } else {
        // For ranges, expand the range into a list of numbers. There could be
        // multiple ranges in the argument, so we need to continue until we've
        // expanded them all
        // i.e. "5-8,10,11-13" -> "5,6,7,8,10,11,12,13"
        let expandedArgString = argString;
        while (expandedArgString.includes('-')) {
          const [start, end] = expandedArgString.match(/(\d+)-(\d+)/)!.slice(1);
          const range = [];
          for (let i = parseInt(start); i <= parseInt(end); i++) {
            range.push(i.toString());
          }
          expandedArgString = expandedArgString.replace(`${start}-${end}`, range.join(','));
        }
        args = expandedArgString.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    steps.push({ type: funcName, args });
  }

  return steps;
}
  