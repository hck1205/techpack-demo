import { useEffect, useMemo, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import type { BlockConfigMap } from "../../../types/blocks";
import { fabricListInspectorAtom } from "../../../state";
import { FabricBlock } from "../FabricBlock";
import { createBlockShellStyle } from "../shared/blockShell";
import type { FabricListBlockProps } from "./FabricListBlock.types";

const DEFAULT_INPUT_COUNT = 2;

export function FabricListBlock({ config, onConfigPatch, className, style }: FabricListBlockProps) {
  const count = Math.max(1, config.count);
  const items = useMemo(() => Array.from({ length: count }, (_, idx) => idx + 1), [count]);
  const setFabricListInspector = useSetAtom(fabricListInspectorAtom);
  const shellRef = useRef<HTMLDivElement>(null);
  const activeFabricIndexFromConfig =
    typeof config.activeFabricIndex === "number" && config.activeFabricIndex >= 1 && config.activeFabricIndex <= count
      ? config.activeFabricIndex
      : null;
  const [localActiveFabricIndex, setLocalActiveFabricIndex] = useState<number | null>(activeFabricIndexFromConfig);
  const [localInputCounts, setLocalInputCounts] = useState<number[]>(() =>
    Array.from({ length: count }, (_, index) => Math.max(1, (config.inputCounts ?? [])[index] ?? DEFAULT_INPUT_COUNT))
  );
  const isControlled = Boolean(onConfigPatch);
  const activeFabricIndex = isControlled ? activeFabricIndexFromConfig : localActiveFabricIndex;
  const inputCounts = isControlled ? (config.inputCounts ?? []) : localInputCounts;

  useEffect(() => {
    if (isControlled) return;
    setLocalActiveFabricIndex(activeFabricIndexFromConfig);
  }, [activeFabricIndexFromConfig, isControlled]);

  useEffect(() => {
    if (isControlled) return;
    setLocalInputCounts((prev) =>
      Array.from({ length: count }, (_, index) => Math.max(1, prev[index] ?? (config.inputCounts ?? [])[index] ?? DEFAULT_INPUT_COUNT))
    );
  }, [count, config.inputCounts, isControlled]);

  const setActiveFabricIndex = (nextIndex: number | null) => {
    if (isControlled) {
      onConfigPatch?.({ activeFabricIndex: nextIndex });
      return;
    }
    setLocalActiveFabricIndex(nextIndex);
  };

  const setActiveInputCount = (nextCount: number) => {
    const targetIndex = activeFabricIndex ?? 1;
    const sanitizedCount = Math.max(1, nextCount || 1);
    const nextInputCounts = Array.from({ length: count }, (_, index) => Math.max(1, inputCounts[index] ?? DEFAULT_INPUT_COUNT));
    nextInputCounts[targetIndex - 1] = sanitizedCount;

    if (isControlled) {
      onConfigPatch?.({ activeFabricIndex: targetIndex, inputCounts: nextInputCounts });
      return;
    }

    setLocalActiveFabricIndex(targetIndex);
    setLocalInputCounts(nextInputCounts);
  };

  useEffect(() => {
    const effectiveActiveFabricIndex = activeFabricIndex ?? 1;
    setFabricListInspector({
      activeFabricIndex,
      activeInputCount: Math.max(1, inputCounts[effectiveActiveFabricIndex - 1] ?? DEFAULT_INPUT_COUNT),
      setActiveInputCount,
    });

    return () => setFabricListInspector(null);
  }, [activeFabricIndex, count, inputCounts, setFabricListInspector]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const targetNode = event.target as Node | null;
      const path = event.composedPath();
      const isConfigPanelClick = path.some(
        (node) => node instanceof Element && Boolean(node.closest('[data-fabric-list-deactivate-exempt="true"]'))
      );

      if (!isConfigPanelClick && !shellRef.current?.contains(targetNode as Node) && activeFabricIndex !== null) {
        setActiveFabricIndex(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [activeFabricIndex, setActiveFabricIndex]);

  return (
    <div
      className={["fabric-list-shell", className].filter(Boolean).join(" ")}
      style={createBlockShellStyle(style)}
      ref={shellRef}
    >
      <div className="fabric-list-grid">
        {items.map((item) => (
          <article
            key={item}
            className={`fabric-list-item ${activeFabricIndex === item ? "is-selected" : ""}`}
            onPointerDownCapture={() => setActiveFabricIndex(item)}
            onMouseDownCapture={() => setActiveFabricIndex(item)}
            onClick={() => setActiveFabricIndex(item)}
          >
            <FabricBlock
              className="fabric-list-child-block"
              config={
                {
                  imagePosition: "left",
                  cols: 1,
                  inputCount: Math.max(1, inputCounts[item - 1] ?? DEFAULT_INPUT_COUNT),
                } as BlockConfigMap["fabric"]
              }
              inputCount={Math.max(1, inputCounts[item - 1] ?? DEFAULT_INPUT_COUNT)}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
