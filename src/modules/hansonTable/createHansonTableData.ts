import { HANSON_ROW_COUNT } from "./hansonTable.constants";
import type { HansonTableData, HansonTableRow } from "./hansonTable.types";

const OWNERS = ["MJ", "HS", "YK", "CL", "RM", "JH", "SE"];
const GENDER_GROUPS = ["Men", "Women", "Unisex", "Kids"];
const AGE_GROUPS = ["Adult", "Youth", "Junior"];
const MARKETING_DIVISIONS = ["APAC", "KOREA", "GLOBAL", "EMEA", "NA"];
const SPORTS_CATEGORIES = ["Running", "Football", "Training", "Originals", "Outdoor"];
const PRODUCT_TYPES = ["Footwear", "Apparel", "Accessory"];
const GLOBAL_SIZES = ["XS-XL", "S-3XL", "220-300", "230-310"];
const SPEED_FLAGS = ["Speed", "Inline", "Quickstrike"];
const BRAND_COLLECTIONS = ["Essentials", "Performance", "Originals", "Basketball"];
const GLOBAL_TIERS = ["A", "B", "C"];
const ORDER_TYPE_1 = ["Prebook", "At-once", "Flow"];
const ORDER_TYPE_2 = ["Core", "Seasonal", "Promo"];
const QUARTERS = ["2026Q1", "2026Q2", "2026Q3", "2026Q4"];
const RANGE_SEGMENTS = ["Key City", "Core Retail", "Digital First", "Outlet"];
const CONDITIONAL_FORMAT_DEMO_VALUES = ["Focus", "Core", "Promo", "Archive"];
const ADVANCED_FILTER_SORT_DEMO_VALUES = [
  "Priority-1 / APAC",
  "Priority-2 / EMEA",
  "Priority-3 / NA",
  "Priority-1 / KOREA",
];

export function createHansonTableRow(rowIndex: number): HansonTableRow {
  const rowNumber = rowIndex + 1;
  const dragFillSeed = (rowIndex % 20) + 1;
  const prodNumber = `PRD-${String(100000 + rowIndex).padStart(6, "0")}`;
  const articleNumber = `AR${String(10000000 + rowIndex).slice(-8)}`;
  const modelCode = `MDL-${(rowIndex % 1200) + 100}`;
  const modelName = `Tech Runner ${(rowIndex % 48) + 1}`;
  const colorway = `CW-${String((rowIndex % 999) + 1).padStart(3, "0")}`;
  const orpKrw = 79000 + (rowIndex % 45) * 2500;
  const launchDate = `2026-${String((rowIndex % 12) + 1).padStart(2, "0")}-01`;
  const exitDate = `2027-${String((rowIndex % 12) + 1).padStart(2, "0")}-01`;

  return [
    dragFillSeed,
    `=SUM(A${rowNumber},10)`,
    CONDITIONAL_FORMAT_DEMO_VALUES[rowIndex % CONDITIONAL_FORMAT_DEMO_VALUES.length],
    ADVANCED_FILTER_SORT_DEMO_VALUES[rowIndex % ADVANCED_FILTER_SORT_DEMO_VALUES.length],
    OWNERS[rowIndex % OWNERS.length],
    prodNumber,
    articleNumber,
    modelCode,
    modelName,
    colorway,
    GENDER_GROUPS[rowIndex % GENDER_GROUPS.length],
    AGE_GROUPS[rowIndex % AGE_GROUPS.length],
    MARKETING_DIVISIONS[rowIndex % MARKETING_DIVISIONS.length],
    SPORTS_CATEGORIES[rowIndex % SPORTS_CATEGORIES.length],
    `Division-${(rowIndex % 18) + 1}`,
    `Group-${(rowIndex % 12) + 1}`,
    PRODUCT_TYPES[rowIndex % PRODUCT_TYPES.length],
    `Vertical-${(rowIndex % 6) + 1}`,
    `Segment-${(rowIndex % 9) + 1}`,
    launchDate,
    exitDate,
    GLOBAL_SIZES[rowIndex % GLOBAL_SIZES.length],
    SPEED_FLAGS[rowIndex % SPEED_FLAGS.length],
    BRAND_COLLECTIONS[rowIndex % BRAND_COLLECTIONS.length],
    GLOBAL_TIERS[rowIndex % GLOBAL_TIERS.length],
    `Concept-${(rowIndex % 16) + 1}`,
    `Support-${(rowIndex % 7) + 1}`,
    `SEC-${(rowIndex % 11) + 1}`,
    `LocalGroup-${(rowIndex % 10) + 1}`,
    ORDER_TYPE_1[rowIndex % ORDER_TYPE_1.length],
    ORDER_TYPE_2[rowIndex % ORDER_TYPE_2.length],
    rowIndex % 2 === 0,
    QUARTERS[rowIndex % QUARTERS.length],
    QUARTERS[(rowIndex + 1) % QUARTERS.length],
    `2026-W${String((rowIndex % 52) + 1).padStart(2, "0")}`,
    rowIndex % 3 === 0 ? "Y" : "N",
    orpKrw,
    `=ROUND(AK${rowNumber}/1450,2)`,
    `=ROUND(AK${rowNumber}*1.18,0)`,
    rowIndex % 8 === 0 ? "Carry" : "New",
    RANGE_SEGMENTS[rowIndex % RANGE_SEGMENTS.length],
  ];
}

export function createHansonTableData(rowCount = HANSON_ROW_COUNT): HansonTableData {
  return Array.from({ length: rowCount }, (_, rowIndex) => createHansonTableRow(rowIndex));
}
