import type Handsontable from "handsontable";
import { HyperFormula } from "hyperformula";
import {
  HANSON_COL_HEADERS,
  HANSON_COL_WIDTHS,
  HANSON_LICENSE_KEY,
  HANSON_ROW_HEIGHT,
} from "./hansonTable.constants";
import type { HansonTableData } from "./hansonTable.types";

const DATE_COLUMN_HEADERS = new Set(["Global Retail intro date", "Global Retail exit date"]);
const CURRENCY_COLUMN_HEADERS = new Set(["ORP (KRW)", "Global RRP (EURO)", "Global RRP (KRW)"]);
const CHECKBOX_COLUMN_HEADERS = new Set(["Carry over"]);

function createColumns(): Handsontable.ColumnSettings[] {
  return HANSON_COL_HEADERS.map((header) => {
    if (CHECKBOX_COLUMN_HEADERS.has(header)) {
      return { type: "checkbox" };
    }
    if (DATE_COLUMN_HEADERS.has(header)) {
      return { type: "date", dateFormat: "YYYY-MM-DD", correctFormat: true };
    }
    if (CURRENCY_COLUMN_HEADERS.has(header)) {
      return { type: "numeric", numericFormat: { pattern: "0,0.00" } };
    }

    return { type: "text" };
  });
}

export function createHansonTableSettings(data: HansonTableData): Handsontable.GridSettings {
  return {
    themeName: "ht-theme-main",
    data,
    rowHeaders: true,
    colHeaders: [...HANSON_COL_HEADERS],
    width: "100%",
    height: "100%",
    stretchH: "all",
    rowHeights: HANSON_ROW_HEIGHT,
    colWidths: HANSON_COL_WIDTHS,
    columns: createColumns(),
    fillHandle: { direction: "vertical" },
    hiddenRows: {
      indicators: false,
    },
    contextMenu: {
      items: {
        row_above: {},
        row_below: {},
        col_left: {},
        col_right: {},
        hsep1: "---------",
        remove_row: {},
        remove_col: {},
        hsep2: "---------",
        undo: {},
        redo: {},
        hsep3: "---------",
        mergeCells: {},
      },
    },
    mergeCells: true,
    filters: true,
    dropdownMenu: true,
    multiColumnSorting: {
      headerAction: false,
    },
    formulas: {
      engine: HyperFormula,
    },
    selectionMode: "multiple",
    manualColumnResize: true,
    licenseKey: HANSON_LICENSE_KEY,
  };
}
