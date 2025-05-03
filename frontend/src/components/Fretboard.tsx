import { h } from 'preact';
import { HIGHLIGHT_COLORS, d, margin, fretBoardWidth, fretBoardHeight, stringGap, nutWidth, numOfFrets, fretGap, strokeWidth, stringWidth, fretMarkerRadius, highlightMarkerRadius, highlightMarkerFontSize } from '../constants';
import { getStringY, GuitarString } from '../utils/notes';
import { ReadonlySignal } from '@preact/signals';

interface Marker {
  string: string;
  fret: number;
  label: string;
  color: string | null;
}

interface FretboardProps {
  highlights?: ReadonlySignal<Marker[]>;
}

export function Fretboard({ highlights }: FretboardProps) {
  const fretPositions: number[] = [];
  for (let i = 1; i < numOfFrets; i++) {
    fretPositions.push(i * fretGap);
  }

  const highlightMarkers = (highlights?.value || []).map((m) => {
    const { string, fret, label } = m;
    const x = fret > 0 
      ? (fret === numOfFrets 
        ? fretBoardWidth - nutWidth - fretGap / 2 
        : fretPositions[fret - 1] - fretGap / 2) 
      : -nutWidth;
    const y = getStringY(string as GuitarString);
    
    return (
      <g transform={`translate(${x}, ${y})`}>
        <circle
          id={`highlight-${string}-${fret}-marker`}
          cx={0}
          cy={0}
          r={highlightMarkerRadius}
          fill={m.color ?? HIGHLIGHT_COLORS.NOTE}
          stroke="black"
        />
        <text
          x={0}
          y={0}
          dy="0.35em"
          text-anchor="middle"
          fill="white"
          stroke="white"
          stroke-width="0.25"
          style={`font: ${highlightMarkerFontSize}px sans-serif`}
        >
          {label}
        </text>
      </g>
    );
  });

  return (
    <svg width={d.w} height={d.h}>
      <g id="fretboard" transform={`translate(${margin.left}, ${margin.top})`} width={d.w - margin.left - margin.right} height={d.h - margin.top - margin.bottom}>
        <rect id="nut" width={nutWidth} height={fretBoardHeight} fill="black" />
        <g id="strings-and-frets" transform={`translate(${nutWidth}, 0)`} stroke-width={strokeWidth} stroke="black">
          <line id="high-e" x1={0} y1={getStringY(GuitarString.e)} x2={stringWidth} y2={getStringY(GuitarString.e)} />
          <line id="b" x1={0} y1={getStringY(GuitarString.B)} x2={stringWidth} y2={getStringY(GuitarString.B)} />
          <line id="g" x1={0} y1={getStringY(GuitarString.G)} x2={stringWidth} y2={getStringY(GuitarString.G)} />
          <line id="d" x1={0} y1={getStringY(GuitarString.D)} x2={stringWidth} y2={getStringY(GuitarString.D)} />
          <line id="a" x1={0} y1={getStringY(GuitarString.A)} x2={stringWidth} y2={getStringY(GuitarString.A)} />
          <line id="low-e" x1={0} y1={getStringY(GuitarString.E)} x2={stringWidth} y2={getStringY(GuitarString.E)} />
          {fretPositions.map((x, i) => (
            <line id={`fret-${i + 1}`} x1={x} y1={0} x2={x} y2={fretBoardHeight} />
          ))}
          <line id="fret-last" x1={fretBoardWidth - nutWidth} y1={0} x2={fretBoardWidth - nutWidth} y2={fretBoardHeight} />
          <g id="fret-markers" fill="black" stroke="black" stroke-width={1}>
            <circle id="fret-3-marker" cx={fretPositions[2] - fretGap / 2} cy={fretBoardHeight / 2} r={fretMarkerRadius} />
            <circle id="fret-5-marker" cx={fretPositions[4] - fretGap / 2} cy={fretBoardHeight / 2} r={fretMarkerRadius} />
            <circle id="fret-7-marker" cx={fretPositions[6] - fretGap / 2} cy={fretBoardHeight / 2} r={fretMarkerRadius} />
            <circle id="fret-9-marker" cx={fretPositions[8] - fretGap / 2} cy={fretBoardHeight / 2} r={fretMarkerRadius} />
            <circle id="fret-12-marker-1" cx={fretPositions[11] - fretGap / 2} cy={(fretBoardHeight / 2) - stringGap} r={fretMarkerRadius} />
            <circle id="fret-12-marker-2" cx={fretPositions[11] - fretGap / 2} cy={(fretBoardHeight / 2) + stringGap} r={fretMarkerRadius} />
            <circle id="fret-15-marker-1" cx={fretPositions[14] - fretGap / 2} cy={(fretBoardHeight / 2)} r={fretMarkerRadius} />
          </g>
          {highlightMarkers}
        </g>
      </g>
    </svg>
  );
} 