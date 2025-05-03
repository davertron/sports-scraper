import { stringGap, strokeWidth } from '../constants';

export enum GuitarString {
  E = 'E',
  A = 'A',
  D = 'D',
  G = 'G',
  B = 'B',
  e = 'e'
}

export function getStringY(string: GuitarString): number {
  return {
    [GuitarString.E]: 5 * stringGap - strokeWidth / 2,
    [GuitarString.A]: 4 * stringGap,
    [GuitarString.D]: 3 * stringGap,
    [GuitarString.G]: 2 * stringGap,
    [GuitarString.B]: stringGap,
    [GuitarString.e]: strokeWidth / 2,
  }[string];
} 