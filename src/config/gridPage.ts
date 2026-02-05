export const GRID_COLS = 20;
export const GRID_ROW_HEIGHT = 50;
export const GRID_MARGIN_X = 1;
export const GRID_MARGIN_Y = 1;

export type GridBlockPreset = {
  key: string;
  label: string;
  w: number;
  h: number;
};

export const GRID_BLOCK_PRESETS: GridBlockPreset[] = [
  { key: "1x1", label: "1x1", w: 1, h: 1 },
  { key: "2x2", label: "2x2", w: 2, h: 2 },
  { key: "3x3", label: "3x3", w: 3, h: 3 },
  { key: "4x4", label: "4x4", w: 4, h: 4 },
  { key: "2x3", label: "2x3", w: 2, h: 3 },
  { key: "2x4", label: "2x4", w: 2, h: 4 },
  { key: "3x4", label: "3x4", w: 3, h: 4 },
  { key: "3x5", label: "3x5", w: 3, h: 5 },
  { key: "4x6", label: "4x6", w: 4, h: 6 },
  { key: "4x7", label: "4x7", w: 4, h: 7 },
];
