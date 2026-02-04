import type { BlockConfig, BlockConfigMap, BlockType } from "../../../types/blocks";

export type BlockContainerProps = {
  type: BlockType;
  selected: boolean;
  config: BlockConfig;
  onActivate?: () => void;
  onGroupingConfigPatch?: (patch: Partial<BlockConfigMap["grouping-template"]>) => void;
  onFabricListConfigPatch?: (patch: Partial<BlockConfigMap["fabric-list"]>) => void;
};
