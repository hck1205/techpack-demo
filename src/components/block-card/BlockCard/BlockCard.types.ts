import type { BlockConfig, BlockConfigMap, BlockType } from "../../../types/blocks";

export type BlockCardProps = {
  type: BlockType;
  config: BlockConfig;
  isActive: boolean;
  onSlotLayoutConfigPatch?: (patch: Partial<BlockConfigMap["slot-layout"]>) => void;
  onFabricListConfigPatch?: (patch: Partial<BlockConfigMap["fabric-list"]>) => void;
};
