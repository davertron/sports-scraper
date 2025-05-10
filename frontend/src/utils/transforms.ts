import { getKey, Note } from "./notes";

export type Transform = {
  type: 'filter' | 'map';
  args: any[];
};

export function applyTransforms(notes: Note[], transforms: Transform[]): Note[] {
    let result = notes;
    for (const transform of transforms) {
        switch (transform.type) {
            case 'filter':
                switch (transform.args[0]) {
                    case 'key-of':
                        const key = getKey(transform.args[1]);
                        result = result.filter(note => key.includes(note.note));
                        break;
                    case 'between-frets':
                        let frets = [];
                        if (transform.args[1].includes('-')) {
                            let [start, end] = transform.args[1].split('-').map(Number);
                            for (let i = start; i <= end; i++) {
                                frets.push(i);
                            }
                        } else {
                            frets.push(Number(transform.args[1]));
                        }
                        result = result.filter(note => frets.includes(note.fret));
                        break;
                    case 'on-strings':
                        result = result.filter(note => transform.args[1].includes(note.string));
                        break;
                }
                break;
        }
    }
    return result;
}