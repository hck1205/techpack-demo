import type { BlockConfigMap } from "../../../types/blocks";
import type { BlockShellProps } from "../shared/blockShell";

export type DummyBlockProps = BlockShellProps & {
  config: BlockConfigMap["dummy"];
};
