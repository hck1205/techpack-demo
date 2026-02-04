import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import type { FabricBlockProps } from "./FabricBlock.types";

const makeGrid = (rows: number, cols: number) =>
  Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => `R${r + 1}-C${c + 1}`));

const resizeGrid = (prev: string[][], nextRows: number, nextCols: number) => {
  const rows = Math.max(1, nextRows);
  const cols = Math.max(1, nextCols);
  return Array.from({ length: rows }, (_, rowIndex) =>
    Array.from({ length: cols }, (_, colIndex) => prev[rowIndex]?.[colIndex] ?? "")
  );
};

export function FabricBlock({ config }: FabricBlockProps) {
  const [grid, setGrid] = useState<string[][]>(() => makeGrid(config.rows, config.cols));
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    setGrid((prev) =>
      resizeGrid(prev, config.rows, config.cols).map((row, r) =>
        r === rowIndex ? row.map((cell, c) => (c === colIndex ? value : cell)) : row
      )
    );
  };

  return (
    <div className="fabric-block-shell">
      <div className={`fabric-layout pos-${config.imagePosition}`}>
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
          <div className="fabric-grid" style={{ gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: Math.max(1, config.rows) }, (_, rowIndex) =>
              Array.from({ length: Math.max(1, config.cols) }, (_, colIndex) => (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  className="fabric-cell-input"
                  value={grid[rowIndex]?.[colIndex] ?? ""}
                  onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
