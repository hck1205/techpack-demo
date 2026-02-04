import type { BlockConfigMap, BlockType } from "../../../types/blocks";

export type GroupingTemplateBlockProps = {
  config: BlockConfigMap["grouping-template"];
  onConfigPatch?: (patch: Partial<BlockConfigMap["grouping-template"]>) => void;
};

export type GroupingPaneBlock = {
  type: Exclude<BlockType, "grouping-template">;
  createdAt: number;
};
