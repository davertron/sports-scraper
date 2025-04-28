import { h } from 'preact';
import { HIGHLIGHT_COLORS, d, margin, fretBoardWidth, fretBoardHeight, stringGap, nutWidth, numOfFrets, fretGap, strokeWidth, stringWidth, fretMarkerRadius, highlightMarkerRadius, highlightMarkerFontSize } from '../constants';
import { getStringY } from '../utils/notes';

interface Marker {
  string: string;
  fret: number;
  label: string;
  color?: string;
}

interface FretboardProps {
  highlights?: { value: Marker[] };
}

export function Fretboard({ highlights }: FretboardProps) {
  const fretPositions = [];
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
    const y = getStringY(string);
    
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
      <rect id="background" width={d.w} height={d.h} />
      <g id="fretboard" transform={`translate(${margin.left}, ${margin.top})`} width={d.w - margin.left - margin.right} height={d.h - margin.top - margin.bottom}>
        <rect id="nut" width={nutWidth} height={fretBoardHeight} fill="black" />
        <g id="strings-and-frets" transform={`translate(${nutWidth}, 0)`} stroke-width={strokeWidth} stroke="black">
          <line id="high-e" x1={0} y1={getStringY('e')} x2={stringWidth} y2={getStringY('e')} />
          <line id="b" x1={0} y1={getStringY('B')} x2={stringWidth} y2={getStringY('B')} />
          <line id="g" x1={0} y1={getStringY('G')} x2={stringWidth} y2={getStringY('G')} />
          <line id="d" x1={0} y1={getStringY('D')} x2={stringWidth} y2={getStringY('D')} />
          <line id="a" x1={0} y1={getStringY('A')} x2={stringWidth} y2={getStringY('A')} />
          <line id="low-e" x1={0} y1={getStringY('E')} x2={stringWidth} y2={getStringY('E')} />
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