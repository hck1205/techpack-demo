import { DndContext, type DragEndEvent, type DragStartEvent, useDraggable } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { GRID_BLOCK_PRESETS } from '../config/gridPage';

type DndBlockItem = {
  id: string;
  label: string;
  w: number;
  h: number;
  x: number;
  y: number;
};

type Size = { width: number; height: number };

const clamp = (value: number, min: number) => Math.max(min, Number.isFinite(value) ? value : min);
const preventInvalidNumberInput = (event: KeyboardEvent<HTMLInputElement>) => {
  if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
    event.preventDefault();
  }
};

const getNextY = (items: DndBlockItem[]) =>
  items.reduce((max, item) => Math.max(max, item.y + item.h), 0);

const useResizeObserver = (ref: RefObject<HTMLElement | null>): Size => {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = ref?.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};

function DraggableBlock({
  block,
  style,
  isSelected,
  onSelect,
  isResizing,
  onResizeStart,
}: {
  block: DndBlockItem;
  style: CSSProperties;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isResizing: boolean;
  onResizeStart: (id: string, event: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    disabled: isResizing,
  });

  const blockStyle: CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 6 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`grid-empty-block dnd-grid-block ${isSelected ? 'is-selected' : ''}`}
      style={blockStyle}
      onMouseDown={(event) => {
        event.stopPropagation();
        onSelect(block.id);
      }}
      {...listeners}
      {...attributes}
    >
      <span>{block.label}</span>
      <small>
        {block.w}x{block.h}
      </small>
      <div
        className="dnd-resize-handle"
        onPointerDown={(event) => onResizeStart(block.id, event)}
        role="presentation"
      />
    </button>
  );
}

export function DndPage() {
  const [items, setItems] = useState<DndBlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const resizeStateRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  useResizeObserver(canvasRef);

  useEffect(() => {
    if (!resizingId) return;

    const handlePointerMove = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;
      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;
      const nextW = Math.max(gridSize, state.startW + deltaX);
      const nextH = Math.max(gridSize, state.startH + deltaY);
      setItems((prev) =>
        prev.map((item) =>
          item.id === state.id
            ? {
                ...item,
                w: nextW,
                h: nextH,
              }
            : item,
        ),
      );
    };

    const handlePointerUp = () => {
      setResizingId(null);
      resizeStateRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [resizingId, gridSize]);

  const onResizeStart = (id: string, event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    resizeStateRef.current = {
      id,
      startX: event.clientX,
      startY: event.clientY,
      startW: item.w,
      startH: item.h,
    };
    setResizingId(id);
  };

  const addBlock = (presetKey: string) => {
    const preset = GRID_BLOCK_PRESETS.find((item) => item.key === presetKey);
    if (!preset) return;

    const id = `dnd-${preset.key}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    setItems((prev) => {
      const nextY = getNextY(prev);
      const next = [
        ...prev,
        {
          id,
          label: preset.label,
          w: preset.w * gridSize,
          h: preset.h * gridSize,
          x: 0,
          y: nextY,
        },
      ];
      return next;
    });
    setSelectedBlockId(id);
  };

  const deleteSelected = () => {
    if (!selectedBlockId) return;
    setItems((prev) => prev.filter((item) => item.id !== selectedBlockId));
    setSelectedBlockId(null);
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setSelectedBlockId(id);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const id = String(event.active.id);
    const deltaX = event.delta.x;
    const deltaY = event.delta.y;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextX = item.x + deltaX;
        const nextY = item.y + deltaY;
        return {
          ...item,
          x: Math.max(0, nextX),
          y: Math.max(0, nextY),
        };
      }),
    );
  };

  return (
    <div className="app-shell grid-page-shell dnd-page-shell">
      <main className="editor-panel">
        <div className="editor-body tools-open">
          <aside className="left-panel grid-left-panel">
            <section className="grid-panel-card">
              <div className="panel-title">Empty Blocks</div>
              <div className="grid-preset-list">
                {GRID_BLOCK_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    className="grid-preset-button"
                    onClick={() => addBlock(preset.key)}
                  >
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
              <button
                type="button"
                className="grid-preset-button"
                onClick={() => setShowGrid((prev) => !prev)}
                aria-pressed={showGrid}
              >
                {showGrid ? "Hide Rule" : "Show Rule"}
              </button>
              <label className="config-field">
                <span>GRID_SIZE (px)</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={gridSize}
                  onKeyDown={preventInvalidNumberInput}
                  onChange={(e) => setGridSize(clamp(Number(e.target.value), 1))}
                />
              </label>
            </section>
          </aside>

          <section className="canvas-panel">
            <div
              className="canvas-drop-zone grid-canvas-responsive"
              ref={canvasRef}
              onMouseDown={(event) => {
                const target = event.target as HTMLElement;
                if (!target.closest('.dnd-grid-block')) {
                  setSelectedBlockId(null);
                }
              }}
            >
              <DndContext
                modifiers={[restrictToParentElement]}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                <div
                  className={`dnd-grid ${showGrid ? 'is-grid-visible' : ''}`}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                  }}
                >
                  {items.map((item) => {
                    return (
                      <DraggableBlock
                        key={item.id}
                        block={item}
                        isSelected={selectedBlockId === item.id}
                        onSelect={setSelectedBlockId}
                        isResizing={resizingId === item.id}
                        onResizeStart={onResizeStart}
                        style={{
                          position: 'absolute',
                          left: item.x,
                          top: item.y,
                          width: item.w,
                          height: item.h,
                          touchAction: 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </DndContext>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
