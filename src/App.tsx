import type { DragEvent as ReactDragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import GridLayout, { WidthProvider, type Layout, type LayoutItem } from "react-grid-layout/legacy";
import { BLOCK_SIZE, GRID_COLS, GRID_MARGIN_X, GRID_MARGIN_Y, GRID_ROW_HEIGHT } from "./config/blocks";
import { BlockConfigPanel } from "./components/block-config";
import { BlockContainer } from "./components/block-container";
import { BlockLibraryPanel } from "./components/block-library";
import { LoadLayoutsModal, StorageToolbar } from "./components/storage";
import { SlidesPanel } from "./components/slides";
import {
  activeSlideAtom,
  addDroppedBlockAtom,
  draggingTypeAtom,
  layoutAtom,
  selectedBlockIdAtom,
  updateBlockConfigAtom,
  updateLayoutAtom,
} from "./state";
import type { BlockConfigMap, BlockType } from "./types/blocks";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import "@excalidraw/excalidraw/index.css";

const AutoGridLayout = WidthProvider(GridLayout);

function App() {
  const canvasDropZoneRef = useRef<HTMLDivElement | null>(null);
  const activeSlide = useAtomValue(activeSlideAtom);
  const layout = useAtomValue(layoutAtom);
  const [draggingType] = useAtom(draggingTypeAtom);
  const selectedBlockId = useAtomValue(selectedBlockIdAtom);
  const setSelectedBlockId = useSetAtom(selectedBlockIdAtom);
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(true);
  const [maxRows, setMaxRows] = useState(1);
  const updateLayout = useSetAtom(updateLayoutAtom);
  const addDroppedBlock = useSetAtom(addDroppedBlockAtom);
  const updateBlockConfig = useSetAtom(updateBlockConfigAtom);

  useEffect(() => {
    const node = canvasDropZoneRef.current;
    if (!node) return;

    const recalcMaxRows = () => {
      const effectiveHeight = Math.max(1, node.clientHeight - GRID_MARGIN_Y * 2);
      const rowUnit = GRID_ROW_HEIGHT + GRID_MARGIN_Y;
      const nextRows = Math.max(1, Math.floor((effectiveHeight + GRID_MARGIN_Y) / rowUnit));
      setMaxRows(nextRows);
    };

    recalcMaxRows();
    const observer = new ResizeObserver(recalcMaxRows);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const onLayoutChange = (nextLayout: Layout) => {
    const clampedLayout = nextLayout.map((layoutItem) => {
      const nextH = Math.min(layoutItem.h, maxRows);
      const maxY = Math.max(0, maxRows - nextH);
      return {
        ...layoutItem,
        h: nextH,
        y: Math.min(layoutItem.y, maxY),
      };
    });
    updateLayout(clampedLayout);
  };

  const onDropBlock = (_layout: Layout, droppedItem: LayoutItem | undefined, event: Event) => {
    if (!droppedItem) return;

    const nativeEvent = event as DragEvent;
    const blockType =
      (nativeEvent.dataTransfer?.getData("block/type") as BlockType | "") || draggingType || "";
    if (!blockType) return;
    const blockSize = BLOCK_SIZE[blockType];
    if (blockSize.h > maxRows) return;

    const maxY = Math.max(0, maxRows - blockSize.h);
    const limitedDroppedItem = {
      ...droppedItem,
      y: Math.min(droppedItem.y, maxY),
    };
    addDroppedBlock({ droppedItem: limitedDroppedItem, blockType });
  };

  const onGridDropDragOver = (event: ReactDragEvent) => {
    const blockType = (event.dataTransfer.getData("block/type") as BlockType | "") || draggingType;
    if (!blockType) return false;
    if (BLOCK_SIZE[blockType].h > maxRows) return false;
    return BLOCK_SIZE[blockType];
  };

  return (
    <div className="app-shell">
      <SlidesPanel />

      <main className="editor-panel">
        <div className={`editor-body ${isToolPanelOpen ? "tools-open" : "tools-collapsed"}`}>
          <div className={`left-panel-wrapper ${isToolPanelOpen ? "is-open" : "is-collapsed"}`}>
            <button
              className="left-panel-toggle"
              onClick={() => setIsToolPanelOpen((prev) => !prev)}
              aria-label={isToolPanelOpen ? "Collapse tools panel" : "Expand tools panel"}
            >
              {isToolPanelOpen ? "◀" : "▶"}
            </button>
            {isToolPanelOpen ? (
              <aside className="left-panel">
                <StorageToolbar />
                <BlockLibraryPanel />
                <BlockConfigPanel />
              </aside>
            ) : null}
          </div>

          <section className="canvas-panel">
            <div
              ref={canvasDropZoneRef}
              className="canvas-drop-zone"
              onMouseDown={(event) => {
                const target = event.target as HTMLElement;
                if (!target.closest(".react-grid-item")) {
                  setSelectedBlockId(null);
                }
              }}
            >
              <AutoGridLayout
                className={`rgl-canvas ${draggingType ? "is-dragging" : ""}`}
                layout={layout}
                cols={GRID_COLS}
                rowHeight={GRID_ROW_HEIGHT}
                isDraggable
                isResizable
                draggableHandle=".block-drag-handle"
                margin={[GRID_MARGIN_X, GRID_MARGIN_Y]}
                containerPadding={[GRID_MARGIN_X, GRID_MARGIN_Y]}
                isDroppable
                droppingItem={{ i: "__drop__", x: 0, y: 0, w: 2, h: 2 }}
                onLayoutChange={onLayoutChange}
                onDrop={onDropBlock}
                onDropDragOver={onGridDropDragOver}
                compactType="vertical"
                maxRows={maxRows}
                preventCollision={false}
              >
                {activeSlide.items.map((item) => (
                  <div key={item.id}>
                    <BlockContainer
                      type={item.type}
                      selected={selectedBlockId === item.id}
                      config={item.config}
                      onActivate={() => setSelectedBlockId(item.id)}
                      onGroupingConfigPatch={(patch) => {
                        if (item.type !== "grouping-template") return;
                        updateBlockConfig({
                          itemId: item.id,
                          type: "grouping-template",
                          patch: patch as Partial<BlockConfigMap["grouping-template"]>,
                        });
                      }}
                      onFabricListConfigPatch={(patch) => {
                        if (item.type !== "fabric-list") return;
                        updateBlockConfig({
                          itemId: item.id,
                          type: "fabric-list",
                          patch,
                        });
                      }}
                    />
                  </div>
                ))}
              </AutoGridLayout>
            </div>
          </section>
        </div>
      </main>

      <LoadLayoutsModal />
    </div>
  );
}

export default App;
