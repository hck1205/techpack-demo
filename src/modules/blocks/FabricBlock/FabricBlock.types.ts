import type { BlockConfigMap } from "../../../types/blocks";
import type { BlockShellProps } from "../shared/blockShell";

export type FabricBlockProps = BlockShellProps & {
  config: BlockConfigMap["fabric"];
  inputCount?: number;
};
