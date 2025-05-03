export const HIGHLIGHT_COLORS = {
  ROOT: '#58b441',
  NOTE: '#f65128',
  LIGHT_NOTE: '#F88062',
  BLUE: '#0d6191',
  GREEN: '#ecf9f3',
  WHITE: '#ffffff',
};

export const d = {w: 1200, h: 250};
export const margin = {top: 40, bottom: 40, left: 40, right: 40};
export const fretBoardWidth = d.w - margin.left - margin.right;
export const fretBoardHeight = d.h - margin.top - margin.bottom;
export const stringGap = fretBoardHeight / 5;
export const nutWidth = 40;
export const numOfFrets = 16;
export const fretGap = (fretBoardWidth - nutWidth) / numOfFrets;
export const strokeWidth = 3;
export const stringWidth = fretBoardWidth - nutWidth;
export const fretMarkerRadius = (stringGap / 2) * 0.7;
export const highlightMarkerRadius = (stringGap / 2) * 0.9;
export const highlightMarkerFontSize = stringGap * 0.5; 