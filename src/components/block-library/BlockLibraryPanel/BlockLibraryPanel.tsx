import type { DragEvent as ReactDragEvent } from "react";
import { useSetAtom } from "jotai";
import { BLOCKS } from "../../../config/blocks";
import { draggingTypeAtom } from "../../../state";
import { BlockBar, BlockItemButton, BlockList, PanelTitle } from "./BlockLibraryPanel.styled";
import type { PaletteBlockProps } from "./BlockLibraryPanel.types";

export function BlockLibraryPanel() {
  const setDraggingType = useSetAtom(draggingTypeAtom);

  return (
    <BlockBar>
      <PanelTitle>Block Library</PanelTitle>
      <BlockList>
        {BLOCKS.map((block) => <PaletteBlock key={block.type} type={block.type} label={block.label} onDragStart={setDraggingType} onDragEnd={() => setDraggingType(null)} />)}
      </BlockList>
    </BlockBar>
  );
}

function PaletteBlock({ type, label, onDragStart, onDragEnd }: PaletteBlockProps) {
  const handleDragStart = (event: ReactDragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData("block/type", type);
    event.dataTransfer.setData("text/plain", type);
    event.dataTransfer.effectAllowed = "copy";
    onDragStart(type);
  };

  return (
    <BlockItemButton draggable onDragStart={handleDragStart} onDragEnd={onDragEnd}>
      {label}
    </BlockItemButton>
  );
}
