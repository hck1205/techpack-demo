import { Excalidraw } from "@excalidraw/excalidraw";
import type { ConstructionBlockProps } from "./ConstructionBlock.types";

export function ConstructionBlock({ config: _config, isActive = false }: ConstructionBlockProps) {
  return (
    <div className={`construction-shell ${isActive ? "is-active" : "is-inactive"}`}>
      <div className="construction-canvas">
        <Excalidraw
          handleKeyboardGlobally
          viewModeEnabled={!isActive}
          UIOptions={{
            canvasActions: {
              loadScene: false,
              export: false,
              saveToActiveFile: false,
              toggleTheme: false,
              clearCanvas: false,
              saveAsImage: false,
              changeViewBackgroundColor: false,
            },
          }}
          initialData={{
            appState: {
              viewBackgroundColor: "transparent",
              currentItemStrokeColor: "#ef4444",
              currentItemStrokeWidth: 2,
            },
          }}
        />
      </div>
    </div>
  );
}
