export type BlockType =
  | "table"
  | "react-table"
  | "construction"
  | "fabric"
  | "fabric-list"
  | "editor"
  | "slot-layout";

export type ImagePosition = "left" | "right" | "top" | "bottom";
export type EditorAction = "none" | "insert-text" | "insert-image" | "insert-table";

export type BlockConfigMap = {
  table: {
    height: number;
    indicators: boolean;
  };
  "react-table": {
    rowLimit: number;
  };
  construction: {
    compactTools: boolean;
  };
  fabric: {
    imagePosition: ImagePosition;
    cols: number;
    inputCount: number;
  };
  "fabric-list": {
    layout: "vertical" | "horizontal" | "grid";
    count: number;
    gridCols: number;
    activeFabricIndex: number | null;
    inputCounts: number[];
  };
  "slot-layout": {
    split: "vertical" | "horizontal";
    defaultSize: number;
    areaCount: number;
    deleteAreaNonce: number;
  };
  editor: {
    actionNonce: number;
    pendingAction: EditorAction;
    textToInsert: string;
    imageUrl: string;
    tableRows: number;
    tableCols: number;
  };
};

export type BlockConfig = BlockConfigMap[BlockType];

export type GridItem = {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  config: BlockConfig;
};

export type Slide = {
  id: string;
  title: string;
  items: GridItem[];
};

export type BlockDefinition = {
  type: BlockType;
  label: string;
  w: number;
  h: number;
};

export type UpdateBlockConfig = <T extends BlockType>(
  itemId: string,
  type: T,
  patch: Partial<BlockConfigMap[T]>
) => void;
