import { Transform } from '../utils/transforms';
import { Signal } from '@preact/signals';
import { margin } from '../constants';
import { NOTE_ORDER } from '../utils/notes';

interface QueryInputProps {
  transforms: Signal<Transform[]>;
}

export function QueryInput({ transforms }: QueryInputProps) {

  // TODO: Many of these functions are the same/similar and could be re-used.
  // They basically boil down to either updating the type or the arg at the
  // given index.
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

  function updateTransformType(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].type = value as 'filter' | 'map';
    if (value === 'filter') {
      newTransforms[transformIndex].args = ['key-of', 'C'];
    } else if (value === 'map') {
      newTransforms[transformIndex].args = ['color-notes', 'C', '#FF0000'];
    }
    transforms.value = newTransforms;
  }

  function updateColorNotesNote(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[1] = value;
    transforms.value = newTransforms;
  }

  function updateColorNotesColor(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[2] = value;
    transforms.value = newTransforms;
  }

  function updateColorDegreesDegree(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[1] = value;
    transforms.value = newTransforms;
  }

  function updateColorDegreesColor(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[2] = value;
    transforms.value = newTransforms;
  }

  function updateAddDegreeKey(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[1] = value;
    transforms.value = newTransforms;
  }

  function updateMapType(transformIndex: number, value: string) {
    const newTransforms = [...transforms.value];
    newTransforms[transformIndex].args[0] = value;
    if (value === 'color-degrees') {
      newTransforms[transformIndex].args[1] = '1';
    } else if (value === 'color-notes') {
      newTransforms[transformIndex].args[1] = 'C';
    } else if (value === 'add-degree') {
      newTransforms[transformIndex].args[1] = 'C';
    }
    transforms.value = newTransforms;
  }

  return (
    <div style={{ margin: `0 ${margin.left}px` }}>
      {transforms.value.map((t, transformIndex) => (
        <div>
          <select value={t.type} onChange={e => updateTransformType(transformIndex, (e.target as HTMLSelectElement).value)}>
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
                {NOTE_ORDER.map(note => (
                  <option value={note}>{note}</option>
                ))}
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
          {t.type === 'map' && (
            <>
              <select value={t.args[0]} onChange={e => updateMapType(transformIndex, (e.target as HTMLSelectElement).value)}>
                <option value="color-notes">Color notes</option>
                <option value="color-degrees">Color degrees</option>
                <option value="add-degree">Add degree</option>
              </select>
            </>
          )}
          {t.type === 'map' && t.args[0] === 'color-notes' && (
            <>
              <select value={t.args[1]} onChange={e => updateColorNotesNote(transformIndex, (e.target as HTMLSelectElement).value)}>
                {NOTE_ORDER.map(note => (
                  <option value={note}>{note}</option>
                ))}
              </select>
              <input type="color" value={t.args[2]} onChange={e => updateColorNotesColor(transformIndex, (e.target as HTMLInputElement).value)} />
            </>
          )}
          {t.type === 'map' && t.args[0] === 'color-degrees' && (
            <>
              <select value={t.args[1]} onChange={e => updateColorDegreesDegree(transformIndex, (e.target as HTMLSelectElement).value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
              </select>
              <input type="color" value={t.args[2]} onChange={e => updateColorDegreesColor(transformIndex, (e.target as HTMLInputElement).value)} />
            </>
          )}
          {t.type === 'map' && t.args[0] === 'add-degree' && (
            <>
              <select value={t.args[1]} onChange={e => updateAddDegreeKey(transformIndex, (e.target as HTMLSelectElement).value)}>
                {NOTE_ORDER.map(note => (
                  <option value={note}>{note}</option>
                ))}
              </select>
            </>
          )}
          <button onClick={() => removeTransform(transformIndex)}>Remove</button>
        </div>
      ))}
      <button onClick={() => addTransform()}>Add</button>
    </div>
  );
}