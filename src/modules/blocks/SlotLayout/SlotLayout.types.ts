import type { BlockConfigMap, BlockType } from "../../../types/blocks";
import type { BlockShellProps } from "../shared/blockShell";

export type SlotLayoutProps = BlockShellProps & {
  config: BlockConfigMap["slot-layout"];
  onConfigPatch?: (patch: Partial<BlockConfigMap["slot-layout"]>) => void;
};

export type SlotPaneBlock = {
  type: Exclude<BlockType, "slot-layout">;
  createdAt: number;
};
