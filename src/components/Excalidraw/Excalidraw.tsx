import { Excalidraw } from "@excalidraw/excalidraw";
import { EditorWrapper } from "./Excalidraw.styled";

import "@excalidraw/excalidraw/index.css";

interface Props {
  isSelectMode: boolean;
}

const ExcalidrawEditor = ({ isSelectMode }: Props) => {
  return (
    <EditorWrapper disableDrawing={isSelectMode}>
      <Excalidraw
        initialData={{
          appState: {
            viewBackgroundColor: "transparent",
          },
        }}
        viewModeEnabled={isSelectMode}
      />
    </EditorWrapper>
  );
};

export default ExcalidrawEditor;
