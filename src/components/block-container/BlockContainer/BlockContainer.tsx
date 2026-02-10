import { BlockCard } from "../../block-card/BlockCard";
import { Container, Content, DragHandle } from "./BlockContainer.styled";
import type { BlockContainerProps } from "./BlockContainer.types";

export function BlockContainer({
  type,
  selected,
  config,
  onActivate,
  onSlotLayoutConfigPatch,
  onFabricListConfigPatch,
}: BlockContainerProps) {
  return (
    <Container
      selected={selected}
      className="block-card"
      onMouseDownCapture={onActivate}
      onTouchStartCapture={onActivate}
      onClick={onActivate}
    >
      <DragHandle className="block-drag-handle" title="Drag block">
        ⋮
      </DragHandle>
      <Content>
        <BlockCard
          type={type}
          config={config}
          isActive={selected}
          onSlotLayoutConfigPatch={onSlotLayoutConfigPatch}
          onFabricListConfigPatch={onFabricListConfigPatch}
        />
      </Content>
    </Container>
  );
}
