import type { BlockConfigMap } from "../../../types/blocks";
import type { BlockShellProps } from "../shared/blockShell";

export type FabricListBlockProps = BlockShellProps & {
  config: BlockConfigMap["fabric-list"];
  onConfigPatch?: (patch: Partial<BlockConfigMap["fabric-list"]>) => void;
};
