import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { fabricInspectorAtom } from "../../../state";
import { createBlockShellStyle } from "../shared/blockShell";
import type { FabricBlockProps } from "./FabricBlock.types";

export function FabricBlock({ config, inputCount, className, style }: FabricBlockProps) {
  const legacyRows = (config as { rows?: number }).rows;
  const isFabricListChild = typeof inputCount === "number";
  const setFabricInspector = useSetAtom(fabricInspectorAtom);
  const [localConfig, setLocalConfig] = useState(() => ({
    imagePosition: config.imagePosition,
    cols: Math.max(1, config.cols),
    inputCount: Math.max(1, config.inputCount ?? legacyRows ?? 1),
  }));
  const resolvedInputCount = Math.max(1, inputCount ?? localConfig.inputCount);
  const resolvedCols = Math.max(1, Math.min(localConfig.cols, resolvedInputCount));
  const [inputs, setInputs] = useState<string[]>(() => Array.from({ length: resolvedInputCount }, () => ""));
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isFabricListChild) return;
    setLocalConfig({
      imagePosition: config.imagePosition,
      cols: Math.max(1, config.cols),
      inputCount: Math.max(1, config.inputCount ?? legacyRows ?? 1),
    });
  }, [config.imagePosition, config.cols, config.inputCount, legacyRows, isFabricListChild]);

  useEffect(() => {
    setInputs((prev) => Array.from({ length: resolvedInputCount }, (_, index) => prev[index] ?? ""));
  }, [resolvedInputCount]);

  const publishFabricInspector = (nextConfig: typeof localConfig) => {
    setFabricInspector({
      imagePosition: nextConfig.imagePosition,
      inputCount: nextConfig.inputCount,
      cols: nextConfig.cols,
      setImagePosition: (value) => {
        setLocalConfig((prev) => {
          const updated = { ...prev, imagePosition: value };
          publishFabricInspector(updated);
          return updated;
        });
      },
      setInputCount: (value) => {
        setLocalConfig((prev) => {
          const updated = { ...prev, inputCount: Math.max(1, value || 1) };
          publishFabricInspector(updated);
          return updated;
        });
      },
      setCols: (value) => {
        setLocalConfig((prev) => {
          const updated = { ...prev, cols: Math.max(1, value || 1) };
          publishFabricInspector(updated);
          return updated;
        });
      },
    });
  };

  useEffect(() => {
    if (isFabricListChild) return;
    return () => setFabricInspector(null);
  }, [isFabricListChild, setFabricInspector]);

  const onPickImage = () => {
    fileInputRef.current?.click();
  };

  const onImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageSrc(reader.result);
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const updateCell = (index: number, value: string) => {
    setInputs((prev) => prev.map((cell, i) => (i === index ? value : cell)));
  };

  return (
    <div
      className={["fabric-block-shell", className].filter(Boolean).join(" ")}
      style={createBlockShellStyle(style)}
      onPointerDownCapture={() => {
        if (isFabricListChild) return;
        publishFabricInspector(localConfig);
      }}
      onMouseDownCapture={() => {
        if (isFabricListChild) return;
        publishFabricInspector(localConfig);
      }}
    >
      <div className={`fabric-layout pos-${localConfig.imagePosition}`}>
        <div className={`fabric-image-panel ${imageSrc ? "" : "is-empty"}`}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="fabric-file-input"
            onChange={onImageChange}
          />
          {imageSrc ? (
            <img src={imageSrc} alt="fabric upload" className="fabric-stage-bg" />
          ) : (
            <button
              type="button"
              className="fabric-image-empty-btn"
              onClick={onPickImage}
              aria-label="Upload image"
            >
              <span className="fabric-plus-icon">+</span>
            </button>
          )}
        </div>

        <div className="fabric-grid-panel">
          <div className="fabric-grid" style={{ gridTemplateColumns: `repeat(${resolvedCols}, minmax(0, 1fr))` }}>
            {Array.from({ length: resolvedInputCount }, (_, index) => (
              <input
                key={index}
                className="fabric-cell-input"
                value={inputs[index] ?? ""}
                onChange={(event) => updateCell(index, event.target.value)}
                placeholder={`Field ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
