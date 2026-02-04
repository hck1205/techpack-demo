import { useMemo } from "react";
import { HotTable } from "@handsontable/react-wrapper";
import { registerAllModules } from "handsontable/registry";
import { TableShell } from "./TableBlock.styled";
import type { TableBlockProps } from "./TableBlock.types";

registerAllModules();

export function TableBlock({ config }: TableBlockProps) {
  const data = useMemo(
    () => [
      ["Keyboard", "Alice", "2026-02-10", "High", "In Progress", true],
      ["Mouse", "Brian", "2026-02-18", "Medium", "Todo", false],
      ["Monitor", "Chris", "2026-02-03", "High", "Blocked", false],
      ["Headset", "Dana", "2026-02-25", "Low", "Done", true],
      ["Webcam", "Ethan", "2026-03-02", "Medium", "In Progress", true],
      ["Mic", "Fiona", "2026-03-08", "Low", "Todo", false],
    ],
    []
  );

  const columns = useMemo(
    () => [
      { type: "text" },
      {
        type: "autocomplete",
        source: ["Alice", "Brian", "Chris", "Dana", "Ethan", "Fiona", "Gina"],
        strict: false,
      },
      { type: "date", dateFormat: "YYYY-MM-DD", correctFormat: true },
      { type: "dropdown", source: ["High", "Medium", "Low"] },
      { type: "dropdown", source: ["Todo", "In Progress", "Blocked", "Done"] },
      { type: "checkbox" },
    ],
    []
  );

  const mergeCells = useMemo(
    () => [
      { row: 0, col: 0, rowspan: 1, colspan: 2 },
    ],
    []
  );

  const tableContextMenu: unknown = useMemo(
    () => ({
      items: {
        row_above: {},
        row_below: {},
        col_left: {},
        col_right: {},
        hsep1: "---------",
        hidden_rows_hide: {},
        hidden_rows_show: {},
        hidden_columns_hide: {},
        hidden_columns_show: {},
        hsep2: "---------",
        undo: {},
        redo: {},
        hsep3: "---------",
        mergeCells: {},
      },
    }),
    []
  );

  return (
    <TableShell className="block-table-shell">
      <HotTable
        themeName="ht-theme-main"
        data={data}
        columns={columns}
        rowHeaders
        colHeaders={["Item Alias", "Owner", "Due Date", "Priority", "Status", "Approved"]}
        width="100%"
        height="100%"
        stretchH="all"
        autoWrapRow
        autoWrapCol
        manualRowMove
        manualColumnMove
        selectionMode="multiple"
        hiddenRows={{ indicators: config.indicators }}
        hiddenColumns={{ indicators: config.indicators }}
        contextMenu={tableContextMenu as never}
        mergeCells={mergeCells}
        manualColumnResize
        manualRowResize
        readOnly={false}
        licenseKey="non-commercial-and-evaluation"
      />
    </TableShell>
  );
}
