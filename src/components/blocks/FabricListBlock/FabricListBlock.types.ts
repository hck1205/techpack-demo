import type { BlockConfigMap } from "../../../types/blocks";

export type FabricListBlockProps = {
  config: BlockConfigMap["fabric-list"];
  onConfigPatch?: (patch: Partial<BlockConfigMap["fabric-list"]>) => void;
};
