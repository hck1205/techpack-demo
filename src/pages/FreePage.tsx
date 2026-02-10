import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  useDraggable,
} from '@dnd-kit/core';
import { createSnapModifier, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { FloatingRouteNav } from '../components/navigation/FloatingRouteNav';
import { GRID_BLOCK_PRESETS } from '../config/gridPage';

type DndBlockItem = {
  id: string;
  label: string;
  w: number;
  h: number;
  x: number;
  y: number;
};

type RulerTick = { position: number; label: string; isMajor: boolean; isCenter: boolean };
type ObjectAlignGuide = { axis: 'x' | 'y'; position: number };

const snapToGrid = (value: number, unit: number) => Math.round(value / unit) * unit;
const PIXELS_PER_CM = 37.7952755906;
const FIXED_CANVAS_WIDTH = 1200;
const FIXED_CANVAS_HEIGHT = 1400;
const MIN_PAGE_WIDTH = 100;
const MIN_PAGE_HEIGHT = 100;
const RULER_THICKNESS = 34;
const RULER_MINOR_STEP_CM = 0.5;
const ZOOM_STEP = 25;
const MIN_ZOOM_PERCENT = 25;
const MAX_ZOOM_PERCENT = 400;
const DEFAULT_BLOCK_SIZE_UNIT = 20;
const preventInvalidNumberInput = (event: KeyboardEvent<HTMLInputElement>) => {
  if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
    event.preventDefault();
  }
};

const getNextY = (items: DndBlockItem[]) =>
  items.reduce((max, item) => Math.max(max, item.y + item.h), 0);
const isHorizontallyCentered = (item: DndBlockItem, canvasWidth: number, tolerance: number) =>
  Math.abs(item.x + item.w / 2 - canvasWidth / 2) <= tolerance;
const isVerticallyCentered = (item: DndBlockItem, canvasHeight: number, tolerance: number) =>
  Math.abs(item.y + item.h / 2 - canvasHeight / 2) <= tolerance;

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

export function FreePage() {
  const [items, setItems] = useState<DndBlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const gridSize = 1;
  const [showRuler, setShowRuler] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [pageWidth, setPageWidth] = useState(FIXED_CANVAS_WIDTH);
  const [pageHeight, setPageHeight] = useState(FIXED_CANVAS_HEIGHT);
  const [pageWidthInput, setPageWidthInput] = useState(String(FIXED_CANVAS_WIDTH));
  const [pageHeightInput, setPageHeightInput] = useState(String(FIXED_CANVAS_HEIGHT));
  const [showVerticalCenterGuideWhileDragging, setShowVerticalCenterGuideWhileDragging] = useState(false);
  const [showHorizontalCenterGuideWhileDragging, setShowHorizontalCenterGuideWhileDragging] = useState(false);
  const [objectAlignGuides, setObjectAlignGuides] = useState<ObjectAlignGuide[]>([]);
  const nextItemIdRef = useRef(1);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const resizeStateRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const snapToGridModifier = useMemo(() => createSnapModifier(1), []);
  const centerGuideTolerance = 1;
  const zoomScale = zoomPercent / 100;
  const canvasWidth = pageWidth;
  const canvasHeight = pageHeight;
  const baseCanvasOuterWidth = pageWidth + RULER_THICKNESS;
  const baseCanvasOuterHeight = pageHeight + RULER_THICKNESS;
  const scaledCanvasOuterWidth = baseCanvasOuterWidth * zoomScale;
  const scaledCanvasOuterHeight = baseCanvasOuterHeight * zoomScale;
  const pageWidthCm = useMemo(() => (canvasWidth > 0 ? canvasWidth / PIXELS_PER_CM : 0), [canvasWidth]);
  const pageHeightCm = useMemo(() => (canvasHeight > 0 ? canvasHeight / PIXELS_PER_CM : 0), [canvasHeight]);
  const topRulerTicks = useMemo<RulerTick[]>(() => {
    if (canvasWidth <= 0) return [];

    const centerX = canvasWidth / 2;
    const result: RulerTick[] = [];
    const maxDistanceCm = centerX / PIXELS_PER_CM;

    for (let cm = 0; cm <= maxDistanceCm + RULER_MINOR_STEP_CM; cm += RULER_MINOR_STEP_CM) {
      const offset = cm * PIXELS_PER_CM;
      const leftX = centerX - offset;
      const rightX = centerX + offset;
      const isCenter = cm === 0;
      const isIntegerCm = Number.isInteger(cm);
      const isMajor = isCenter || (isIntegerCm && cm % 5 === 0);
      const labelBase = isIntegerCm ? `${cm}` : "";

      if (leftX >= 0) {
        result.push({
          position: leftX,
          label: isCenter ? "0" : labelBase ? `-${labelBase}` : "",
          isMajor,
          isCenter,
        });
      }
      if (!isCenter && rightX <= canvasWidth) {
        result.push({
          position: rightX,
          label: labelBase,
          isMajor,
          isCenter: false,
        });
      }
    }

    result.push({ position: 0, label: '', isMajor: true, isCenter: false });
    result.push({ position: canvasWidth, label: '', isMajor: true, isCenter: false });

    const deduped = Array.from(
      new Map(result.map((tick) => [Math.round(tick.position * 10) / 10, tick])).values(),
    );

    return deduped.sort((a, b) => a.position - b.position);
  }, [canvasWidth]);
  const leftRulerTicks = useMemo<RulerTick[]>(() => {
    if (canvasHeight <= 0) return [];

    const centerY = canvasHeight / 2;
    const result: RulerTick[] = [];
    const maxDistanceCm = centerY / PIXELS_PER_CM;

    for (let cm = 0; cm <= maxDistanceCm + RULER_MINOR_STEP_CM; cm += RULER_MINOR_STEP_CM) {
      const offset = cm * PIXELS_PER_CM;
      const topY = centerY - offset;
      const bottomY = centerY + offset;
      const isCenter = cm === 0;
      const isIntegerCm = Number.isInteger(cm);
      const isMajor = isCenter || (isIntegerCm && cm % 5 === 0);
      const labelBase = isIntegerCm ? `${cm}` : "";

      if (topY >= 0) {
        result.push({
          position: topY,
          label: isCenter ? "0" : labelBase ? `-${labelBase}` : "",
          isMajor,
          isCenter,
        });
      }
      if (!isCenter && bottomY <= canvasHeight) {
        result.push({
          position: bottomY,
          label: labelBase,
          isMajor,
          isCenter: false,
        });
      }
    }

    result.push({ position: 0, label: '', isMajor: true, isCenter: false });
    result.push({ position: canvasHeight, label: '', isMajor: true, isCenter: false });

    const deduped = Array.from(
      new Map(result.map((tick) => [Math.round(tick.position * 10) / 10, tick])).values(),
    );

    return deduped.sort((a, b) => a.position - b.position);
  }, [canvasHeight]);

  useEffect(() => {
    if (!resizingId) return;

    const handlePointerMove = (event: PointerEvent) => {
      const state = resizeStateRef.current;
      if (!state) return;
      const deltaX = event.clientX - state.startX;
      const deltaY = event.clientY - state.startY;
      const nextW = Math.max(gridSize, snapToGrid(state.startW + deltaX, gridSize));
      const nextH = Math.max(gridSize, snapToGrid(state.startH + deltaY, gridSize));
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
  }, [resizingId]);

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

    const id = `dnd-${preset.key}-${nextItemIdRef.current}`;
    nextItemIdRef.current += 1;
    setItems((prev) => {
      const nextY = getNextY(prev);
      const next = [
        ...prev,
        {
          id,
          label: preset.label,
          w: preset.w * DEFAULT_BLOCK_SIZE_UNIT,
          h: preset.h * DEFAULT_BLOCK_SIZE_UNIT,
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

  const onPageWidthInputChange = (value: string) => {
    if (value === '') {
      setPageWidthInput(value);
      return;
    }
    if (!/^[1-9]\d*$/.test(value)) return;
    setPageWidthInput(value);
    const next = Number(value);
    if (next >= MIN_PAGE_WIDTH) {
      setPageWidth(next);
    }
  };

  const onPageHeightInputChange = (value: string) => {
    if (value === '') {
      setPageHeightInput(value);
      return;
    }
    if (!/^[1-9]\d*$/.test(value)) return;
    setPageHeightInput(value);
    const next = Number(value);
    if (next >= MIN_PAGE_HEIGHT) {
      setPageHeight(next);
    }
  };

  const onPageWidthBlur = () => {
    const parsed = Number(pageWidthInput);
    const next = Number.isFinite(parsed) ? Math.max(parsed, MIN_PAGE_WIDTH) : pageWidth;
    setPageWidth(next);
    setPageWidthInput(String(next));
  };

  const onPageHeightBlur = () => {
    const parsed = Number(pageHeightInput);
    const next = Number.isFinite(parsed) ? Math.max(parsed, MIN_PAGE_HEIGHT) : pageHeight;
    setPageHeight(next);
    setPageHeightInput(String(next));
  };

  const zoomIn = () => {
    setZoomPercent((prev) => Math.min(MAX_ZOOM_PERCENT, prev + ZOOM_STEP));
  };

  const zoomOut = () => {
    setZoomPercent((prev) => Math.max(MIN_ZOOM_PERCENT, prev - ZOOM_STEP));
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setSelectedBlockId(id);
    setObjectAlignGuides([]);
  };

  const onDragMove = (event: DragMoveEvent) => {
    if (canvasWidth <= 0) return;
    const id = String(event.active.id);
    const activeItem = items.find((item) => item.id === id);
    if (!activeItem) {
      setShowVerticalCenterGuideWhileDragging(false);
      setShowHorizontalCenterGuideWhileDragging(false);
      setObjectAlignGuides([]);
      return;
    }

    const nextItem = {
      ...activeItem,
      x: activeItem.x + event.delta.x,
      y: activeItem.y + event.delta.y,
    };
    setShowVerticalCenterGuideWhileDragging(isHorizontallyCentered(nextItem, canvasWidth, centerGuideTolerance));
    setShowHorizontalCenterGuideWhileDragging(isVerticallyCentered(nextItem, canvasHeight, centerGuideTolerance));

    const guideYs: number[] = [];
    const guideXs: number[] = [];
    const nextTop = nextItem.y;
    const nextBottom = nextItem.y + nextItem.h;
    const nextCenterY = nextItem.y + nextItem.h / 2;
    const nextLeft = nextItem.x;
    const nextRight = nextItem.x + nextItem.w;
    const nextCenterX = nextItem.x + nextItem.w / 2;

    items.forEach((item) => {
      if (item.id === id) return;
      const targetTop = item.y;
      const targetBottom = item.y + item.h;
      const targetCenterY = item.y + item.h / 2;
      const targetLeft = item.x;
      const targetRight = item.x + item.w;
      const targetCenterX = item.x + item.w / 2;

      if (Math.abs(nextTop - targetTop) <= centerGuideTolerance) {
        guideYs.push(targetTop);
      }
      if (Math.abs(nextBottom - targetBottom) <= centerGuideTolerance) {
        guideYs.push(targetBottom);
      }
      if (Math.abs(nextCenterY - targetCenterY) <= centerGuideTolerance) {
        guideYs.push(targetCenterY);
      }
      if (Math.abs(nextLeft - targetLeft) <= centerGuideTolerance) {
        guideXs.push(targetLeft);
      }
      if (Math.abs(nextRight - targetRight) <= centerGuideTolerance) {
        guideXs.push(targetRight);
      }
      if (Math.abs(nextCenterX - targetCenterX) <= centerGuideTolerance) {
        guideXs.push(targetCenterX);
      }
    });

    const uniqueGuideYs = Array.from(new Set(guideYs.map((value) => Math.round(value))));
    const uniqueGuideXs = Array.from(new Set(guideXs.map((value) => Math.round(value))));
    setObjectAlignGuides([
      ...uniqueGuideYs.map((position) => ({ axis: 'y' as const, position })),
      ...uniqueGuideXs.map((position) => ({ axis: 'x' as const, position })),
    ]);
  };

  const onDragCancel = () => {
    setShowVerticalCenterGuideWhileDragging(false);
    setShowHorizontalCenterGuideWhileDragging(false);
    setObjectAlignGuides([]);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const id = String(event.active.id);
    const deltaX = event.delta.x;
    const deltaY = event.delta.y;
    setShowVerticalCenterGuideWhileDragging(false);
    setShowHorizontalCenterGuideWhileDragging(false);
    setObjectAlignGuides([]);

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextX = Math.round((item.x + deltaX) / gridSize) * gridSize;
        const nextY = Math.round((item.y + deltaY) / gridSize) * gridSize;
        return {
          ...item,
          x: nextX,
          y: nextY,
        };
      }),
    );
  };

  return (
    <div className="app-shell grid-page-shell dnd-page-shell">
      <main className="editor-panel">
        <div className="editor-body tools-open">
          <aside className="left-panel grid-left-panel">
            <FloatingRouteNav />
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
                onClick={() => setShowRuler((prev) => !prev)}
                aria-pressed={showRuler}
              >
                {showRuler ? 'Hide Ruler' : 'Show Ruler'}
              </button>
              <label className="config-field">
                <span>PAGE_WIDTH (px)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pageWidthInput}
                  onKeyDown={preventInvalidNumberInput}
                  onChange={(e) => onPageWidthInputChange(e.target.value)}
                  onBlur={onPageWidthBlur}
                />
              </label>
              <label className="config-field">
                <span>PAGE_HEIGHT (px)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pageHeightInput}
                  onKeyDown={preventInvalidNumberInput}
                  onChange={(e) => onPageHeightInputChange(e.target.value)}
                  onBlur={onPageHeightBlur}
                />
              </label>
            </section>
          </aside>

          <section className="canvas-panel dnd-canvas-panel">
            <div className="dnd-zoom-controls" aria-label="Zoom controls">
              <button
                type="button"
                className="grid-preset-button"
                onClick={zoomOut}
                disabled={zoomPercent <= MIN_ZOOM_PERCENT}
              >
                -
              </button>
              <span className="dnd-zoom-label">{zoomPercent}%</span>
              <button
                type="button"
                className="grid-preset-button"
                onClick={zoomIn}
                disabled={zoomPercent >= MAX_ZOOM_PERCENT}
              >
                +
              </button>
            </div>
            <div
              className="canvas-drop-zone grid-canvas-static"
              style={{
                flex: '0 0 auto',
                width: scaledCanvasOuterWidth,
                minWidth: scaledCanvasOuterWidth,
                height: scaledCanvasOuterHeight,
                minHeight: scaledCanvasOuterHeight,
              }}
              onMouseDown={(event) => {
                const target = event.target as HTMLElement;
                if (!target.closest('.dnd-grid-block')) {
                  setSelectedBlockId(null);
                }
              }}
            >
              <div
                className="dnd-zoom-stage"
                style={{
                  width: baseCanvasOuterWidth,
                  minWidth: baseCanvasOuterWidth,
                  height: baseCanvasOuterHeight,
                  minHeight: baseCanvasOuterHeight,
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top left',
                }}
              >
                <DndContext
                  modifiers={[snapToGridModifier, restrictToParentElement]}
                  onDragStart={onDragStart}
                  onDragMove={onDragMove}
                  onDragCancel={onDragCancel}
                  onDragEnd={onDragEnd}
                >
                  <div className={`dnd-ruler-layout ${showRuler ? '' : 'is-ruler-hidden'}`}>
                    <div className="dnd-ruler-corner" aria-hidden="true" />
                    <div className="dnd-ruler-bar dnd-ruler-bar-top" aria-hidden="true">
                      <div className="dnd-ruler-summary">Width {pageWidthCm.toFixed(2)} cm</div>
                      <div className="dnd-ruler-track">
                        {topRulerTicks.map((tick) => (
                          <div
                            key={`top-${tick.label}-${Math.round(tick.position)}`}
                            className={`dnd-ruler-tick ${tick.isMajor ? 'is-major' : ''} ${tick.isCenter ? 'is-center' : ''}`}
                            style={{ left: `${tick.position}px` }}
                          >
                            {(tick.isMajor || tick.isCenter) && tick.label ? <span>{tick.label}</span> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="dnd-ruler-bar dnd-ruler-bar-left" aria-hidden="true">
                      <div className="dnd-ruler-summary dnd-ruler-summary-vertical">Height {pageHeightCm.toFixed(2)} cm</div>
                      <div className="dnd-ruler-track">
                        {leftRulerTicks.map((tick) => (
                          <div
                            key={`left-${tick.label}-${Math.round(tick.position)}`}
                            className={`dnd-ruler-tick dnd-ruler-tick-vertical ${tick.isMajor ? 'is-major' : ''} ${tick.isCenter ? 'is-center' : ''}`}
                            style={{ top: `${tick.position}px` }}
                          >
                            {(tick.isMajor || tick.isCenter) && tick.label ? <span>{tick.label}</span> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      className="dnd-grid"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      {showVerticalCenterGuideWhileDragging && <div className="dnd-center-guide" aria-hidden="true" />}
                      {showHorizontalCenterGuideWhileDragging && (
                        <div className="dnd-center-guide dnd-center-guide-horizontal" aria-hidden="true" />
                      )}
                      {objectAlignGuides.map((guide) => (
                        <div
                          key={`${guide.axis}-${guide.position}`}
                          className={`dnd-object-align-guide ${
                            guide.axis === 'y' ? 'dnd-object-align-guide-horizontal' : 'dnd-object-align-guide-vertical'
                          }`}
                          style={guide.axis === 'y' ? { top: `${guide.position}px` } : { left: `${guide.position}px` }}
                          aria-hidden="true"
                        />
                      ))}
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
                  </div>
                </DndContext>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
