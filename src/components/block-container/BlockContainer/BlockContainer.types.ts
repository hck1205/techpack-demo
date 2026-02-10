import type { BlockConfig, BlockConfigMap, BlockType } from "../../../types/blocks";

export type BlockContainerProps = {
  type: BlockType;
  selected: boolean;
  config: BlockConfig;
  onActivate?: () => void;
  onSlotLayoutConfigPatch?: (patch: Partial<BlockConfigMap["slot-layout"]>) => void;
  onFabricListConfigPatch?: (patch: Partial<BlockConfigMap["fabric-list"]>) => void;
};
