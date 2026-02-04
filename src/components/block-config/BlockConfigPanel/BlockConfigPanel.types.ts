import type { BlockConfigMap, BlockType } from "../../../types/blocks";

export type UpdateBlockConfigHandler = <T extends BlockType>(
  itemId: string,
  type: T,
  patch: Partial<BlockConfigMap[T]>
) => void;

export type BlockConfigPanelProps = Record<string, never>;
