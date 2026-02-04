import type { BlockConfigMap } from "../../../types/blocks";

export type ConstructionBlockProps = {
  config: BlockConfigMap["construction"];
  isActive?: boolean;
};
