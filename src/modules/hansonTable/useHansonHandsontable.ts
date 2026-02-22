import { useEffect, type MutableRefObject, type RefObject } from "react";
import Handsontable from "handsontable";
import { registerAllModules } from "handsontable/registry";
import type { HiddenRows } from "handsontable/plugins/hiddenRows";
import { HANSON_COL_HEADERS } from "./hansonTable.constants";
import { createHansonTableSettings } from "./createHansonTableSettings";
import type { HansonConditionalRule, HansonTableData } from "./hansonTable.types";

registerAllModules();

type RowGroup = {
  collapsed: boolean;
  endRow: number;
  id: string;
  label: string;
  startRow: number;
};

type SortOrder = "asc" | "desc" | undefined;
type SortConfig = { column: number; sortOrder: SortOrder };

const DRAG_FILL_COLUMN_INDEX = HANSON_COL_HEADERS.indexOf("drag fill");
const FORMULA_COLUMN_INDEX = HANSON_COL_HEADERS.indexOf("formula");
const CONDITIONAL_FORMAT_COLUMN_INDEX = HANSON_COL_HEADERS.indexOf("conditional formatting");
const ADVANCED_FILTER_SORT_COLUMN_INDEX = HANSON_COL_HEADERS.indexOf("advanced filtering and sorting");
const CONDITIONAL_FORMAT_CLASS_NAMES = [
  "hanson-cf-high",
  "hanson-cf-low",
  "hanson-cf-flag",
  "hanson-cf-boolean",
  "hanson-cf-promo",
  "hanson-cf-focus",
] as const;
const USER_STYLE_CLASS_BY_KEY = {
  green: "hanson-cf-user-green",
  red: "hanson-cf-user-red",
  yellow: "hanson-cf-user-yellow",
  blue: "hanson-cf-user-blue",
  purple: "hanson-cf-user-purple",
} as const;
const USER_STYLE_CLASS_NAMES = Object.values(USER_STYLE_CLASS_BY_KEY);

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value.replaceAll(",", "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isArithmeticProgression(values: number[]): boolean {
  if (values.length <= 2) {
    return false;
  }
  const step = values[1] - values[0];
  for (let index = 2; index < values.length; index += 1) {
    if (values[index] - values[index - 1] !== step) {
      return false;
    }
  }
  return true;
}

function normalizeRange(from: number, to: number): { end: number; start: number } {
  return from <= to ? { start: from, end: to } : { start: to, end: from };
}

function columnLabelToIndex(columnRef: string): number | null {
  const normalized = columnRef.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (!/^[A-Z]+$/.test(normalized)) {
    return null;
  }

  let index = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    index = index * 26 + (normalized.charCodeAt(i) - 64);
  }
  return index - 1;
}

function parseCellRef(value: string): { col: number | null; row: number | null } | null {
  const normalized = value.trim().toUpperCase();
  const match = normalized.match(/^([A-Z]+)?(\d+)?$/);
  if (!match) {
    return null;
  }
  const [, colLabel = "", rowLabel = ""] = match;
  const col = colLabel ? columnLabelToIndex(colLabel) : null;
  const row = rowLabel ? Number(rowLabel) - 1 : null;
  if (row !== null && (!Number.isFinite(row) || row < 0)) {
    return null;
  }
  return { col, row };
}

function parseRangeRef(rangeRef: string): { colEnd: number; colStart: number; rowEnd: number; rowStart: number } | null {
  const normalized = rangeRef.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (/^\d+$/.test(normalized)) {
    const oneBased = Number(normalized);
    if (!Number.isFinite(oneBased) || oneBased < 1) {
      return null;
    }
    const colIndex = oneBased - 1;
    return {
      colStart: colIndex,
      colEnd: colIndex,
      rowStart: 0,
      rowEnd: Number.MAX_SAFE_INTEGER,
    };
  }

  const parts = normalized.split(":");
  if (parts.length === 1) {
    const parsed = parseCellRef(parts[0]);
    if (!parsed || parsed.col === null) {
      return null;
    }
    return {
      colStart: parsed.col,
      colEnd: parsed.col,
      rowStart: parsed.row ?? 0,
      rowEnd: parsed.row ?? Number.MAX_SAFE_INTEGER,
    };
  }

  if (parts.length === 2) {
    const left = parseCellRef(parts[0]);
    const right = parseCellRef(parts[1]);
    if (!left || !right || left.col === null || right.col === null) {
      return null;
    }
    const leftRow = left.row ?? 0;
    const rightRow = right.row ?? Number.MAX_SAFE_INTEGER;
    return {
      colStart: Math.min(left.col, right.col),
      colEnd: Math.max(left.col, right.col),
      rowStart: Math.min(leftRow, rightRow),
      rowEnd: Math.max(leftRow, rightRow),
    };
  }

  return null;
}

function matchesRange(row: number, col: number, rangeRef: string): boolean {
  const parsed = parseRangeRef(rangeRef);
  if (!parsed) {
    return false;
  }
  return col >= parsed.colStart && col <= parsed.colEnd && row >= parsed.rowStart && row <= parsed.rowEnd;
}

function indexToColumnLabel(index: number): string {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    const rem = (value - 1) % 26;
    label = String.fromCharCode(65 + rem) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
}

function normalizeSortConfig(config: unknown): SortConfig[] {
  if (!Array.isArray(config)) {
    return [];
  }
  return config
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const maybe = item as { column?: unknown; sortOrder?: unknown };
      if (typeof maybe.column !== "number") {
        return null;
      }
      const order = maybe.sortOrder === "asc" || maybe.sortOrder === "desc" ? maybe.sortOrder : undefined;
      return { column: maybe.column, sortOrder: order } as SortConfig;
    })
    .filter((item): item is SortConfig => item !== null);
}

function matchUserRule(value: unknown, rule: HansonConditionalRule): boolean {
  const text = typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);
  const normalizedText = text.trim().toLowerCase();
  const value1 = (rule.value1 ?? "").trim();
  const value2 = (rule.value2 ?? "").trim();

  switch (rule.operator) {
    case "greaterThan": {
      const left = toNumber(value);
      const right = toNumber(value1);
      return left !== null && right !== null && left > right;
    }
    case "lessThan": {
      const left = toNumber(value);
      const right = toNumber(value1);
      return left !== null && right !== null && left < right;
    }
    case "between": {
      const left = toNumber(value);
      const low = toNumber(value1);
      const high = toNumber(value2);
      if (left === null || low === null || high === null) {
        return false;
      }
      const min = Math.min(low, high);
      const max = Math.max(low, high);
      return left >= min && left <= max;
    }
    case "equalTo": {
      const leftNum = toNumber(value);
      const rightNum = toNumber(value1);
      if (leftNum !== null && rightNum !== null) {
        return leftNum === rightNum;
      }
      return normalizedText === value1.toLowerCase();
    }
    case "containsText":
      return value1.length > 0 && normalizedText.includes(value1.toLowerCase());
    case "notContainsText":
      return value1.length > 0 && !normalizedText.includes(value1.toLowerCase());
    case "isEmpty":
      return normalizedText.length === 0;
    case "isNotEmpty":
      return normalizedText.length > 0;
    default:
      return false;
  }
}

export function useHansonHandsontable(
  containerRef: RefObject<HTMLDivElement | null>,
  data: HansonTableData,
  hotInstanceRef?: MutableRefObject<Handsontable | null>,
  conditionalRulesRef?: MutableRefObject<HansonConditionalRule[]>,
  onSelectionRangeChange?: (rangeRef: string) => void
): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let isShiftPressed = false;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift" || event.shiftKey) {
        isShiftPressed = true;
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift" || !event.shiftKey) {
        isShiftPressed = false;
      }
    };
    const handleBlur = () => {
      isShiftPressed = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    const hot = new Handsontable(container, createHansonTableSettings(data));
    if (hotInstanceRef) {
      hotInstanceRef.current = hot;
    }
    const hiddenRowsPlugin = hot.getPlugin("hiddenRows") as HiddenRows | undefined;
    const groups = new Map<string, RowGroup>();
    let groupSeq = 0;

    const findGroupByRow = (row: number): RowGroup | null => {
      for (const group of groups.values()) {
        if (row >= group.startRow && row <= group.endRow) {
          return group;
        }
      }
      return null;
    };

    const findGroupByStartRow = (row: number): RowGroup | null => {
      for (const group of groups.values()) {
        if (row === group.startRow) {
          return group;
        }
      }
      return null;
    };

    const syncGroupCellMeta = () => {
      for (let row = 0; row < hot.countRows(); row += 1) {
        hot.setCellMeta(row, 0, "className", "");
      }

      for (const group of groups.values()) {
        hot.setCellMeta(
          group.startRow,
          0,
          "className",
          group.collapsed ? "hanson-group-row-cell is-collapsed" : "hanson-group-row-cell"
        );
      }
    };

    const collapseGroup = (group: RowGroup) => {
      if (!hiddenRowsPlugin?.isEnabled() || group.collapsed) {
        return;
      }
      const rowsToHide: number[] = [];
      for (let row = group.startRow + 1; row <= group.endRow; row += 1) {
        rowsToHide.push(row);
      }
      hiddenRowsPlugin.hideRows(rowsToHide);
      group.collapsed = true;
    };

    const expandGroup = (group: RowGroup) => {
      if (!hiddenRowsPlugin?.isEnabled() || !group.collapsed) {
        return;
      }
      const rowsToShow: number[] = [];
      for (let row = group.startRow + 1; row <= group.endRow; row += 1) {
        rowsToShow.push(row);
      }
      hiddenRowsPlugin.showRows(rowsToShow);
      group.collapsed = false;
    };

    const removeGroup = (group: RowGroup) => {
      expandGroup(group);
      groups.delete(group.id);
    };

    const toggleGroupById = (groupId: string) => {
      const group = groups.get(groupId);
      if (!group) {
        return;
      }
      if (group.collapsed) {
        expandGroup(group);
      } else {
        collapseGroup(group);
      }
      syncGroupCellMeta();
      hot.render();
    };

    const undoRedoPlugin = hot.getPlugin("undoRedo") as
      | { undo?: () => void; redo?: () => void }
      | undefined;

    const groupSelectedRows = () => {
      const selected = hot.getSelectedRangeLast();
      if (!selected) {
        return;
      }
      const normalized = normalizeRange(selected.from.row, selected.to.row);
      if (normalized.end - normalized.start < 1) {
        return;
      }

      for (let row = normalized.start; row <= normalized.end; row += 1) {
        if (findGroupByRow(row)) {
          return;
        }
      }

      const id = `user-group-${groupSeq}`;
      groupSeq += 1;
      groups.set(id, {
        collapsed: false,
        endRow: normalized.end,
        id,
        label: `Rows ${normalized.start + 1}-${normalized.end + 1}`,
        startRow: normalized.start,
      });
      syncGroupCellMeta();
      hot.render();
    };

    const ungroupSelectedRows = () => {
      const selected = hot.getSelectedRangeLast();
      if (!selected) {
        return;
      }
      const group = findGroupByRow(selected.from.row);
      if (!group) {
        return;
      }
      removeGroup(group);
      syncGroupCellMeta();
      hot.render();
    };

    const collapseSelectedGroup = () => {
      const selected = hot.getSelectedRangeLast();
      if (!selected) {
        return;
      }
      const group = findGroupByRow(selected.from.row);
      if (!group) {
        return;
      }
      collapseGroup(group);
      syncGroupCellMeta();
      hot.render();
    };

    const expandSelectedGroup = () => {
      const selected = hot.getSelectedRangeLast();
      if (!selected) {
        return;
      }
      const group = findGroupByRow(selected.from.row);
      if (!group) {
        return;
      }
      expandGroup(group);
      syncGroupCellMeta();
      hot.render();
    };

    hot.updateSettings({
      contextMenu: {
        items: {
          row_above: {},
          row_below: {},
          col_left: {},
          col_right: {},
          hsep1: "---------",
          group_rows: {
            name: "Group selected rows",
            callback: () => groupSelectedRows(),
          },
          ungroup_rows: {
            name: "Ungroup selected rows",
            callback: () => ungroupSelectedRows(),
          },
          collapse_group: {
            name: "Collapse group",
            callback: () => collapseSelectedGroup(),
          },
          expand_group: {
            name: "Expand group",
            callback: () => expandSelectedGroup(),
          },
          hsep2: "---------",
          remove_row: {},
          remove_col: {},
          hsep3: "---------",
          undo: {},
          redo: {},
          hsep4: "---------",
          mergeCells: {},
        },
      },
    });

    hot.addHook("beforeAutofill", (_selectionData, sourceRange, targetRange, direction) => {
      if (!isShiftPressed) {
        return;
      }
      if (!(direction === "down" || direction === "up")) {
        return;
      }

      const sourceColStart = sourceRange.from.col;
      const sourceColEnd = sourceRange.to.col;
      const targetColStart = targetRange.from.col;
      const targetColEnd = targetRange.to.col;
      const isSingleColumn = sourceColStart === sourceColEnd && targetColStart === targetColEnd;
      if (!isSingleColumn || sourceColStart !== targetColStart) {
        return;
      }

      const seed: number[] = [];
      for (let row = sourceRange.from.row; row <= sourceRange.to.row; row += 1) {
        const value = toNumber(hot.getDataAtCell(row, sourceColStart));
        if (value === null) {
          return;
        }
        seed.push(value);
      }

      const isSingleSeed = seed.length === 1;
      if (!isSingleSeed && !isArithmeticProgression(seed)) {
        return;
      }

      const step = isSingleSeed ? 1 : seed[seed.length - 1] - seed[seed.length - 2];
      const directionStep = direction === "up" ? -step : step;
      const rowDistance = Math.abs(targetRange.to.row - targetRange.from.row) + 1;
      const start = seed[seed.length - 1];

      return Array.from({ length: rowDistance }, (_, rowOffset) => [
        start + directionStep * (rowOffset + 1),
      ]);
    });

    const handleSpreadsheetShortcuts = (event: KeyboardEvent) => {
      const target = event.target as Node | null;
      const inTable = target ? hot.rootElement.contains(target) : false;
      const isListening = typeof hot.isListening === "function" ? hot.isListening() : false;
      if (!inTable && !isListening) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (mod && key === "z" && !event.shiftKey) {
        event.preventDefault();
        undoRedoPlugin?.undo?.();
        return;
      }

      if ((mod && key === "y") || (mod && event.shiftKey && key === "z")) {
        event.preventDefault();
        undoRedoPlugin?.redo?.();
        return;
      }

      if (mod && key === "a") {
        event.preventDefault();
        hot.selectAll();
        return;
      }

      if (event.altKey && event.shiftKey && event.key === "ArrowRight") {
        event.preventDefault();
        groupSelectedRows();
        return;
      }

      if (event.altKey && event.shiftKey && event.key === "ArrowLeft") {
        event.preventDefault();
        ungroupSelectedRows();
        return;
      }

      if (event.altKey && event.shiftKey && event.key === "ArrowDown") {
        event.preventDefault();
        collapseSelectedGroup();
        return;
      }

      if (event.altKey && event.shiftKey && event.key === "ArrowUp") {
        event.preventDefault();
        expandSelectedGroup();
        return;
      }

      if (mod && event.altKey && key === "=") {
        event.preventDefault();
        const selected = hot.getSelectedRangeLast();
        const rowIndex = selected ? Math.max(selected.from.row, selected.to.row) + 1 : 0;
        hot.alter("insert_row_below", rowIndex, 1);
        return;
      }

      if (mod && event.altKey && key === "-") {
        event.preventDefault();
        const selected = hot.getSelectedRangeLast();
        if (!selected) {
          return;
        }
        const normalized = normalizeRange(selected.from.row, selected.to.row);
        hot.alter("remove_row", normalized.start, normalized.end - normalized.start + 1);
        return;
      }

      if (mod && event.altKey && event.shiftKey && key === "=") {
        event.preventDefault();
        const selected = hot.getSelectedRangeLast();
        const colIndex = selected ? Math.max(selected.from.col, selected.to.col) + 1 : 0;
        hot.alter("insert_col_end", colIndex, 1);
        return;
      }

      if (mod && event.altKey && event.shiftKey && key === "-") {
        event.preventDefault();
        const selected = hot.getSelectedRangeLast();
        if (!selected) {
          return;
        }
        const normalized = normalizeRange(selected.from.col, selected.to.col);
        hot.alter("remove_col", normalized.start, normalized.end - normalized.start + 1);
      }
    };

    window.addEventListener("keydown", handleSpreadsheetShortcuts, true);

    hot.addHook("afterSelectionEnd", (row, col, row2, col2) => {
      if (!onSelectionRangeChange) {
        return;
      }
      const rowRange = normalizeRange(row, row2);
      const colRange = normalizeRange(col, col2);
      const startRef = `${indexToColumnLabel(colRange.start)}${rowRange.start + 1}`;
      const endRef = `${indexToColumnLabel(colRange.end)}${rowRange.end + 1}`;
      onSelectionRangeChange(startRef === endRef ? startRef : `${startRef}:${endRef}`);
    });

    hot.addHook("afterGetRowHeader", (row, th) => {
      th.classList.remove("hanson-outline-header");
      const oldToggle = th.querySelector(".hanson-outline-toggle");
      oldToggle?.remove();

      if (row < 0) {
        return;
      }

      const group = findGroupByStartRow(row);
      if (!group) {
        return;
      }

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "hanson-outline-toggle";
      toggle.dataset.groupId = group.id;
      toggle.textContent = group.collapsed ? "+" : "−";
      toggle.title = group.collapsed ? "Expand group" : "Collapse group";
      th.classList.add("hanson-outline-header");
      th.appendChild(toggle);
    });

    hot.addHook("afterGetColHeader", (col, th) => {
      th.classList.remove("hanson-sortable-header");
      const oldToggle = th.querySelector(".hanson-sort-toggle");
      oldToggle?.remove();

      if (col < 0) {
        return;
      }

      const sortingPlugin = hot.getPlugin("multiColumnSorting") as
        | { getSortConfig?: () => unknown }
        | undefined;
      const sortConfig = normalizeSortConfig(sortingPlugin?.getSortConfig?.());
      const current = sortConfig.find((item) => item.column === col);
      const indicator = current?.sortOrder === "asc" ? "▲" : current?.sortOrder === "desc" ? "▼" : "↕";

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "hanson-sort-toggle";
      toggle.dataset.col = String(col);
      toggle.textContent = indicator;
      toggle.title = "Sort";
      th.classList.add("hanson-sortable-header");
      th.appendChild(toggle);
    });

    hot.addHook("afterRenderer", (td, row, col, _prop, value) => {
      if (row < 0 || col < 0) {
        return;
      }

      td.classList.remove(...CONDITIONAL_FORMAT_CLASS_NAMES, ...USER_STYLE_CLASS_NAMES);

      if (col === DRAG_FILL_COLUMN_INDEX) {
        const numericValue = toNumber(value);
        if (numericValue !== null && numericValue >= 15) {
          td.classList.add("hanson-cf-high");
        } else if (numericValue !== null && numericValue <= 5) {
          td.classList.add("hanson-cf-low");
        }
      }

      if (col === FORMULA_COLUMN_INDEX && typeof value === "string" && value.trim().startsWith("=")) {
        td.classList.add("hanson-cf-flag");
      }

      if (
        col === CONDITIONAL_FORMAT_COLUMN_INDEX &&
        typeof value === "string" &&
        value.trim().toLowerCase().includes("promo")
      ) {
        td.classList.add("hanson-cf-boolean");
      }

      if (col === ADVANCED_FILTER_SORT_COLUMN_INDEX && typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (normalized.includes("priority-1")) {
          td.classList.add("hanson-cf-promo");
        } else if (normalized.includes("priority-3")) {
          td.classList.add("hanson-cf-focus");
        }
      }

      const userRules = conditionalRulesRef?.current ?? [];
      for (const rule of userRules) {
        if (!rule.enabled) {
          continue;
        }
        if (!matchesRange(row, col, rule.columnRef)) {
          continue;
        }
        if (!matchUserRule(value, rule)) {
          continue;
        }
        td.classList.add(USER_STYLE_CLASS_BY_KEY[rule.styleKey]);
      }
    });

    const handleOutlineToggleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const toggle = target?.closest(".hanson-outline-toggle") as HTMLElement | null;
      if (!toggle) {
        return;
      }

      const groupId = toggle.dataset.groupId;
      if (!groupId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      toggleGroupById(groupId);
    };

    const handleSortToggleMouseDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const sortToggle = target?.closest(".hanson-sort-toggle") as HTMLElement | null;
      if (!sortToggle) {
        return;
      }

      const col = Number(sortToggle.dataset.col);
      if (!Number.isFinite(col)) {
        return;
      }

      const sortingPlugin = hot.getPlugin("multiColumnSorting") as
        | {
            getSortConfig?: () => unknown;
            sort?: (config: SortConfig | SortConfig[]) => void;
          }
        | undefined;

      const currentConfig = normalizeSortConfig(sortingPlugin?.getSortConfig?.());
      const current = currentConfig.find((item) => item.column === col);
      const nextOrder: SortOrder =
        current?.sortOrder === "asc" ? "desc" : current?.sortOrder === "desc" ? undefined : "asc";

      const isMultiSort = event.shiftKey;
      let nextConfig: SortConfig[] = [];

      if (isMultiSort) {
        nextConfig = currentConfig.filter((item) => item.column !== col);
        if (nextOrder) {
          nextConfig.push({ column: col, sortOrder: nextOrder });
        }
      } else if (nextOrder) {
        nextConfig = [{ column: col, sortOrder: nextOrder }];
      }

      sortingPlugin?.sort?.(nextConfig);

      event.preventDefault();
      event.stopPropagation();
      hot.render();
    };

    hot.rootElement.addEventListener("mousedown", handleOutlineToggleMouseDown, true);
    hot.rootElement.addEventListener("mousedown", handleSortToggleMouseDown, true);

    return () => {
      if (hotInstanceRef) {
        hotInstanceRef.current = null;
      }
      hot.rootElement.removeEventListener("mousedown", handleOutlineToggleMouseDown, true);
      hot.rootElement.removeEventListener("mousedown", handleSortToggleMouseDown, true);
      hot.destroy();
      window.removeEventListener("keydown", handleSpreadsheetShortcuts, true);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [containerRef, data, hotInstanceRef, conditionalRulesRef, onSelectionRangeChange]);
}
