export type HansonTableCell = string | number | boolean | null;

export type HansonTableRow = HansonTableCell[];

export type HansonTableData = HansonTableRow[];

export type HansonRowGroup = {
  childRowIndexes: number[];
  id: string;
  label: string;
  rowIndex: number;
};

export type HansonGroupedTableData = {
  data: HansonTableData;
  groups: HansonRowGroup[];
};

export type HansonConditionalOperator =
  | "greaterThan"
  | "lessThan"
  | "between"
  | "equalTo"
  | "containsText"
  | "notContainsText"
  | "isEmpty"
  | "isNotEmpty";

export type HansonConditionalStyleKey = "green" | "red" | "yellow" | "blue" | "purple";

export type HansonConditionalRule = {
  columnRef: string;
  enabled: boolean;
  id: string;
  operator: HansonConditionalOperator;
  styleKey: HansonConditionalStyleKey;
  value1?: string;
  value2?: string;
};
