import type { BlockType } from "../../../types/blocks";

export type PaletteBlockProps = {
  type: BlockType;
  label: string;
  onDragStart: (type: BlockType) => void;
  onDragEnd: () => void;
};
