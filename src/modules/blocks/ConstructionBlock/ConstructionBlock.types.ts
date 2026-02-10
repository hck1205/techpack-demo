import type { BlockConfigMap } from "../../../types/blocks";
import type { BlockShellProps } from "../shared/blockShell";

export type ConstructionBlockProps = BlockShellProps & {
  config: BlockConfigMap["construction"];
  isActive?: boolean;
};
