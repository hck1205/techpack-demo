import { Excalidraw } from "@excalidraw/excalidraw";
import { createBlockShellStyle } from "../shared/blockShell";
import type { ConstructionBlockProps } from "./ConstructionBlock.types";

export function ConstructionBlock({ config: _config, isActive = false, className, style }: ConstructionBlockProps) {
  const shellClassName = ["construction-shell", isActive ? "is-active" : "is-inactive", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={shellClassName} style={createBlockShellStyle(style)}>
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
