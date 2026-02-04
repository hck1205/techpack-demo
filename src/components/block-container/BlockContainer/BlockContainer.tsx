import { BlockCard } from "../../block-card/BlockCard";
import { Container, Content, DragHandle } from "./BlockContainer.styled";
import type { BlockContainerProps } from "./BlockContainer.types";

export function BlockContainer({
  type,
  selected,
  config,
  onActivate,
  onGroupingConfigPatch,
  onFabricListConfigPatch,
}: BlockContainerProps) {
  return (
    <Container
      selected={selected}
      isDummy={type === "dummy"}
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
          onGroupingConfigPatch={onGroupingConfigPatch}
          onFabricListConfigPatch={onFabricListConfigPatch}
        />
      </Content>
    </Container>
  );
}
