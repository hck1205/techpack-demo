import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import type { FabricListBlockProps } from "./FabricListBlock.types";

const DEFAULT_INPUT_COUNT = 2;

export function FabricListBlock({ config, onConfigPatch }: FabricListBlockProps) {
  const count = Math.max(1, config.count);
  const items = useMemo(() => Array.from({ length: count }, (_, idx) => idx + 1), [count]);
  const [images, setImages] = useState<Record<number, string>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const layout = config.layout;
  const activeFabricIndex = Math.min(Math.max(1, config.activeFabricIndex ?? 1), count);
  const inputCounts = config.inputCounts ?? [];

  const onImageChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const nextImage = typeof reader.result === "string" ? reader.result : null;
      if (!nextImage) return;
      setImages((prev) => ({ ...prev, [index]: nextImage }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="fabric-list-shell">
      <div
        className={`fabric-list-grid layout-${layout}`}
        style={layout === "grid" ? { gridTemplateColumns: `repeat(${Math.max(1, config.gridCols)}, 1fr)` } : {}}
      >
        {items.map((item, index) => (
          <article
            key={item}
            className={`fabric-list-item ${activeFabricIndex === item ? "is-selected" : ""}`}
            onClick={() => onConfigPatch?.({ activeFabricIndex: item })}
          >
            <label className="fabric-list-thumb">
              <input
                type="file"
                accept="image/*"
                className="fabric-file-input"
                onChange={(event) => onImageChange(index, event)}
              />
              {images[index] ? (
                <img src={images[index]} alt={`fabric item ${item}`} className="fabric-list-thumb-image" />
              ) : (
                <span className="fabric-list-thumb-placeholder">+</span>
              )}
            </label>
            <div className="fabric-list-inputs">
              {Array.from({ length: Math.max(1, inputCounts[item - 1] ?? DEFAULT_INPUT_COUNT) }, (_, fieldIndex) => {
                const key = `${item}-${fieldIndex}`;
                return (
                  <input
                    key={key}
                    className="fabric-cell-input"
                    value={inputs[key] ?? ""}
                    onChange={(event) => setInputs((prev) => ({ ...prev, [key]: event.target.value }))}
                    placeholder={`Item ${item} Field ${fieldIndex + 1}`}
                  />
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
