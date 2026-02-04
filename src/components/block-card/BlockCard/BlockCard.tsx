import type { BlockConfigMap } from "../../../types/blocks";
import { ConstructionBlock } from "../../blocks/ConstructionBlock";
import { DummyBlock } from "../../blocks/DummyBlock";
import { EditorBlock } from "../../blocks/EditorBlock";
import { FabricBlock } from "../../blocks/FabricBlock";
import { FabricListBlock } from "../../blocks/FabricListBlock";
import { GroupingTemplateBlock } from "../../blocks/GroupingTemplateBlock";
import { ReactCellTableBlock } from "../../blocks/ReactCellTableBlock";
import { TableBlock } from "../../blocks/TableBlock";
import type { BlockCardProps } from "./BlockCard.types";

export function BlockCard({ type, config, isActive, onGroupingConfigPatch, onFabricListConfigPatch }: BlockCardProps) {
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
  if (type === "dummy") {
    return <DummyBlock config={config as BlockConfigMap["dummy"]} />;
  }
  if (type === "grouping-template") {
    return (
      <GroupingTemplateBlock
        config={config as BlockConfigMap["grouping-template"]}
        onConfigPatch={onGroupingConfigPatch}
      />
    );
  }

  return <TableBlock config={config as BlockConfigMap["table"]} />;
}
