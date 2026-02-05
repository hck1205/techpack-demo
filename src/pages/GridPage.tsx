import { useMemo, useState } from "react";
import GridLayout, { WidthProvider, type Layout, type LayoutItem } from "react-grid-layout/legacy";
import {
  GRID_BLOCK_PRESETS,
  GRID_COLS as DEFAULT_GRID_COLS,
  GRID_MARGIN_X as DEFAULT_GRID_MARGIN_X,
  GRID_MARGIN_Y as DEFAULT_GRID_MARGIN_Y,
  GRID_ROW_HEIGHT as DEFAULT_GRID_ROW_HEIGHT,
} from "../config/gridPage";

const AutoGridLayout = WidthProvider(GridLayout);

type GridBlockItem = {
  id: string;
  label: string;
};

const clamp = (value: number, min: number) => Math.max(min, value || min);

export function GridPage() {
  const [items, setItems] = useState<GridBlockItem[]>([]);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState(DEFAULT_GRID_COLS);
  const [gridRowHeight, setGridRowHeight] = useState(DEFAULT_GRID_ROW_HEIGHT);
  const [gridMarginX, setGridMarginX] = useState(DEFAULT_GRID_MARGIN_X);
  const [gridMarginY, setGridMarginY] = useState(DEFAULT_GRID_MARGIN_Y);
  const [compactMode, setCompactMode] = useState(true);

  const layoutById = useMemo(() => new Map(layout.map((entry) => [entry.i, entry])), [layout]);

  const addBlock = (presetKey: string) => {
    const preset = GRID_BLOCK_PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;

    const id = `grid-${preset.key}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setItems((prev) => [...prev, { id, label: preset.label }]);
    setLayout((prev) => [
      ...prev,
      {
        i: id,
        x: 0,
        y: Infinity,
        w: Math.min(preset.w, gridCols),
        h: preset.h,
      },
    ]);
    setSelectedBlockId(id);
  };

  const deleteSelected = () => {
    if (!selectedBlockId) return;
    setItems((prev) => prev.filter((item) => item.id !== selectedBlockId));
    setLayout((prev) => prev.filter((item) => item.i !== selectedBlockId));
    setSelectedBlockId(null);
  };

  const onLayoutChange = (nextLayout: Layout) => {
    setLayout(
      nextLayout.map((item) => ({
        ...item,
        w: Math.min(Math.max(1, item.w), gridCols),
        h: Math.max(1, item.h),
      }))
    );
  };

  const onGridColsChange = (nextCols: number) => {
    const sanitizedCols = clamp(nextCols, 1);
    setGridCols(sanitizedCols);
    setLayout((prev) =>
      prev.map((entry) => {
        const width = Math.min(Math.max(1, entry.w), sanitizedCols);
        return {
          ...entry,
          w: width,
          x: Math.min(entry.x, Math.max(0, sanitizedCols - width)),
        };
      })
    );
  };

  return (
    <div className="app-shell grid-page-shell">
      <main className="editor-panel">
        <div className="editor-body tools-open">
          <aside className="left-panel grid-left-panel">
            <section className="grid-panel-card">
              <div className="panel-title">Empty Blocks</div>
              <div className="grid-preset-list">
                {GRID_BLOCK_PRESETS.map((preset) => (
                  <button key={preset.key} type="button" className="grid-preset-button" onClick={() => addBlock(preset.key)}>
                    Add {preset.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="grid-panel-card">
              <div className="panel-title">Block Config</div>
              {selectedBlockId ? (
                <>
                  <div className="grid-selected-label">Selected: {selectedBlockId}</div>
                  <button type="button" className="grid-delete-button" onClick={deleteSelected}>
                    Delete Selected Block
                  </button>
                </>
              ) : (
                <div className="config-empty">Select a block to delete it.</div>
              )}
            </section>

            <section className="grid-panel-card">
              <div className="panel-title">Grid Layout</div>
              <label className="config-field checkbox">
                <input type="checkbox" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} />
                <span>Compact mode</span>
              </label>
              <label className="config-field">
                <span>GRID_COLS</span>
                <input type="number" min={1} value={gridCols} onChange={(e) => onGridColsChange(Number(e.target.value))} />
              </label>
              <label className="config-field">
                <span>GRID_ROW_HEIGHT</span>
                <input
                  type="number"
                  min={1}
                  value={gridRowHeight}
                  onChange={(e) => setGridRowHeight(clamp(Number(e.target.value), 1))}
                />
              </label>
              <label className="config-field">
                <span>GRID_MARGIN_X</span>
                <input
                  type="number"
                  min={0}
                  value={gridMarginX}
                  onChange={(e) => setGridMarginX(Math.max(0, Number(e.target.value) || 0))}
                />
              </label>
              <label className="config-field">
                <span>GRID_MARGIN_Y</span>
                <input
                  type="number"
                  min={0}
                  value={gridMarginY}
                  onChange={(e) => setGridMarginY(Math.max(0, Number(e.target.value) || 0))}
                />
              </label>
            </section>
          </aside>

          <section className="canvas-panel">
            <div
              className="canvas-drop-zone"
              onMouseDown={(event) => {
                const target = event.target as HTMLElement;
                if (!target.closest(".react-grid-item")) {
                  setSelectedBlockId(null);
                }
              }}
            >
              <AutoGridLayout
                className="rgl-canvas"
                layout={layout}
                cols={gridCols}
                rowHeight={gridRowHeight}
                isDraggable
                isResizable
                margin={[gridMarginX, gridMarginY]}
                containerPadding={[gridMarginX, gridMarginY]}
                onLayoutChange={onLayoutChange}
                compactType={compactMode ? "vertical" : null}
                preventCollision={false}
              >
                {items.map((item) => {
                  const blockLayout = layoutById.get(item.id);
                  const isSelected = selectedBlockId === item.id;
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        className={`grid-empty-block ${isSelected ? "is-selected" : ""}`}
                        onMouseDown={() => setSelectedBlockId(item.id)}
                        onClick={() => setSelectedBlockId(item.id)}
                        title={item.label}
                      >
                        <span>{item.label}</span>
                        <small>
                          {blockLayout?.w ?? 0}x{blockLayout?.h ?? 0}
                        </small>
                      </button>
                    </div>
                  );
                })}
              </AutoGridLayout>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
