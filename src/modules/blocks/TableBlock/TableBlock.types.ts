import type { BlockConfigMap } from "../../../types/blocks";
import type { BlockShellProps } from "../shared/blockShell";

export type TableBlockProps = BlockShellProps & {
  config: BlockConfigMap["table"];
};
