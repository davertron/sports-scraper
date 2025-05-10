import { Transform } from '../utils/transforms';
import { Signal } from '@preact/signals';

interface QueryInputProps {
  transforms: Signal<Transform[]>;
}

export function QueryInput({ transforms }: QueryInputProps) {

  function updateKeyOfTransform(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[1] = value;
    transforms.value = newTransforms;
  }

  function removeTransform(transformIndex: number) {
    const newTransforms = [...transforms.value];
    newTransforms.splice(transformIndex, 1);
    transforms.value = newTransforms;
  }

  function addTransform() {
    const newTransforms = [...transforms.value];
    newTransforms.push({ type: 'filter', args: ['key-of', 'C'] });
    transforms.value = newTransforms;
  }

  function updateFilter(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[0] = value;

    if (value === 'between-frets') {
      newTransforms[transformIndex].args[1] = '5-8';
    } else if (value === 'on-strings') {
      newTransforms[transformIndex].args[1] = 'E,A,e';
    } else if (value === 'key-of') {
      newTransforms[transformIndex].args[1] = 'C';
    }

    transforms.value = newTransforms;
  }

  // TODO: These two functions aren't working for some reason
  function updateBetweenFrets(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[1] = value;
    transforms.value = newTransforms;
  }

  function updateOnStrings(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[1] = value;
    transforms.value = newTransforms;
  }

  return (
    <div>
      {transforms.value.map((t, transformIndex) => (
        <div>
          <select value={t.type}>
            <option value="filter">Filter</option>
            <option value="map">Map</option>
          </select>
          {t.type === 'filter' && (
            <select value={t.args[0]} onChange={e => updateFilter(transformIndex, (e.target as HTMLSelectElement).value)}>
              <option value="key-of">Key of</option>
              <option value="between-frets">Between frets</option>
              <option value="on-strings">On strings</option>
            </select>
            
          )}
          {t.type === 'filter' && t.args[0] === 'key-of' && (
              <select value={t.args[1]} onChange={e => updateKeyOfTransform(transformIndex, (e.target as HTMLSelectElement).value)}>
                <option value="C">C</option>
                <option value="C#">C#</option>
                <option value="D">D</option>
                <option value="D#">D#</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="F#">F#</option>
                <option value="G">G</option>
                <option value="G#">G#</option>
                <option value="A">A</option>
                <option value="A#">A#</option>
                <option value="B">B</option>
              </select>
          )}
          {t.type === 'filter' && t.args[0] === 'between-frets' && (
            <>
              <input type="text" value={t.args[1]} onChange={e => updateBetweenFrets(transformIndex, (e.target as HTMLInputElement).value)} />
            </>
          )}
          {t.type === 'filter' && t.args[0] === 'on-strings' && (
            <>
              <input type="text" value={t.args[1]} onChange={e => updateOnStrings(transformIndex, (e.target as HTMLInputElement).value)} />
            </>
          )}
          <button onClick={() => removeTransform(transformIndex)}>Remove</button>
        </div>
      ))}
      <button onClick={() => addTransform()}>Add</button>
    </div>
  );
}