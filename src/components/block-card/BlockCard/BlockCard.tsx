import type { BlockConfigMap } from "../../../types/blocks";
import { ConstructionBlock } from "../../../modules/blocks/ConstructionBlock";
import { EditorBlock } from "../../../modules/blocks/EditorBlock";
import { FabricBlock } from "../../../modules/blocks/FabricBlock";
import { FabricListBlock } from "../../../modules/blocks/FabricListBlock";
import { SlotLayout } from "../../../modules/blocks/SlotLayout";
import { ReactCellTableBlock } from "../../../modules/blocks/ReactCellTableBlock";
import { TableBlock } from "../../../modules/blocks/TableBlock";
import type { BlockCardProps } from "./BlockCard.types";

export function BlockCard({ type, config, isActive, onSlotLayoutConfigPatch, onFabricListConfigPatch }: BlockCardProps) {
  if (type === "construction") {
    return <ConstructionBlock config={config as BlockConfigMap["construction"]} isActive={isActive} />;
  }
  if (type === "react-table") {
    return <ReactCellTableBlock config={config as BlockConfigMap["react-table"]} />;
  }
  if (type === "editor") {
    return <EditorBlock isActive={isActive} />;
  }
  if (type === "fabric") {
    return <FabricBlock config={config as BlockConfigMap["fabric"]} />;
  }
  if (type === "fabric-list") {
    return (
      <FabricListBlock
        config={config as BlockConfigMap["fabric-list"]}
        onConfigPatch={onFabricListConfigPatch}
      />
    );
  }
  if (type === "slot-layout") {
    return (
      <SlotLayout
        config={config as BlockConfigMap["slot-layout"]}
        onConfigPatch={onSlotLayoutConfigPatch}
      />
    );
  }

  return <TableBlock config={config as BlockConfigMap["table"]} />;
}
