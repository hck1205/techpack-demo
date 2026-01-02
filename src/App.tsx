import { useState } from "react";
import { ExcalidrawEditor, DraggableBox } from "./components";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import styled from "@emotion/styled";

type Pos = { x: number; y: number };
type PosMap = Record<string, Pos>;

function App() {
  const [isSelectMode, setIsSelectMode] = useState(false);

  const [pos, setPos] = useState<PosMap>({
    A: { x: 20, y: 20 },
    B: { x: 160, y: 20 },
    C: { x: 300, y: 20 },
  });

  const onDragEnd = ({ active, delta }: DragEndEvent) => {
    const id = String(active.id);
    setPos((prev) => ({
      ...prev,
      [id]: { x: prev[id].x + delta.x, y: prev[id].y + delta.y },
    }));
  };

  return (
    <AppContainer className="app-container">
      <SelectModeButton onClick={() => setIsSelectMode(!isSelectMode)}>
        Toggle
      </SelectModeButton>
      <DnDContextWrapper className="dnd-context-wrapper">
        <DndContext onDragEnd={onDragEnd}>
          <div>
            {Object.entries(pos).map(([id, base]) => (
              <DraggableBox key={id} id={id} base={base} />
            ))}
          </div>
        </DndContext>
      </DnDContextWrapper>

      <ExcalidrawEditor isSelectMode={isSelectMode} />
    </AppContainer>
  );
}

const SelectModeButton = styled.button`
  position: absolute;
  top: 60px;
  left: 15px;
  z-index: 4;
  width: 60px;
  height: 35px;
  background-color: rgb(211, 211, 211);
  border: none;
  border-radius: 10%;
  cursor: pointer;
`;

const DnDContextWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
`;

const AppContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  z-index: 3;
`;

export default App;
