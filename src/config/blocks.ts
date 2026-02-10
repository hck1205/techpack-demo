import type { BlockConfig, BlockDefinition, BlockType } from "../types/blocks";

export const GRID_COLS = 20;
export const GRID_ROW_HEIGHT = 1;
export const GRID_MARGIN_X = 1;
export const GRID_MARGIN_Y = 1;

export const BLOCKS: BlockDefinition[] = [
  { type: "table", label: "Table", w: 4, h: 70 },
  { type: "react-table", label: "Table (React Component Cell)", w: 4, h: 70 },
  { type: "construction", label: "Construction Viewer", w: 4, h: 100 },
  { type: "editor", label: "Editor", w: 3, h: 40 },
  { type: "fabric", label: "Fabric", w: 3, h: 30 },
  { type: "fabric-list", label: "Fabric List", w: 6, h: 30 },
];

export const BLOCK_SIZE = Object.fromEntries(BLOCKS.map((block) => [block.type, { w: block.w, h: block.h }])) as Record<
  BlockType,
  { w: number; h: number }
>;

export const defaultBlockConfig = (type: BlockType): BlockConfig => {
  if (type === "table") {
    return { height: 240, indicators: true };
  }
  if (type === "react-table") {
    return { rowLimit: 3 };
  }
  if (type === "construction") {
    return { compactTools: true };
  }
  if (type === "fabric-list") {
    return { layout: "horizontal", count: 4, gridCols: 2, activeFabricIndex: 1, inputCounts: [2, 2, 2, 2] };
  }
  if (type === "slot-layout") {
    return { split: "vertical", defaultSize: 50, areaCount: 2, deleteAreaNonce: 0 };
  }
  if (type === "editor") {
    return {
      actionNonce: 0,
      pendingAction: "none",
      textToInsert: "New text",
      imageUrl: "",
      tableRows: 3,
      tableCols: 3,
    };
  }

  return { imagePosition: "left", cols: 1, inputCount: 3 };
};
