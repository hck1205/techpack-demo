import type { BlockConfig, BlockConfigMap, BlockType } from "../../../types/blocks";

export type BlockCardProps = {
  type: BlockType;
  config: BlockConfig;
  isActive: boolean;
  onGroupingConfigPatch?: (patch: Partial<BlockConfigMap["grouping-template"]>) => void;
  onFabricListConfigPatch?: (patch: Partial<BlockConfigMap["fabric-list"]>) => void;
};
