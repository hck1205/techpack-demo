export const HANSON_ROW_COUNT = 10000;

export const HANSON_BASE_HEADERS = [
  "drag fill",
  "formula",
  "conditional formatting",
  "advanced filtering and sorting",
  "담당자",
  "Prod Number (Orig.)",
  "Article Number",
  "Model Code",
  "Model name",
  "Colorway",
  "Gender Group",
  "Age Group",
  "Marketing Division",
  "Sports Category",
  "Product Div. Desc",
  "Product Group",
  "Product Type",
  "Vertical Concept",
  "Business Segment",
  "Global Retail intro date",
  "Global Retail exit date",
  "Global Size",
  "Speed flags",
  "Brand Collection",
  "Global Tier",
  "Key Concept (MKT)",
  "Key Concept Support",
  "MKTP Product Concept (SEC)",
  "Local Product group",
  "Order Type 1",
  "Order Type 2",
  "Carry over",
  "Sell in Qtr",
  "Retail intro Qtr",
  "Retail Intro",
  "Global Hard Launching",
  "ORP (KRW)",
  "Global RRP (EURO)",
  "Global RRP (KRW)",
  "Var.",
  "Range Segmentation",
] as const;

export const HANSON_COL_HEADERS = [...HANSON_BASE_HEADERS];

export const HANSON_COL_WIDTHS = HANSON_COL_HEADERS.map((header) => {
  if (header.includes("date")) {
    return 138;
  }
  if (header.includes("Qtr")) {
    return 110;
  }
  if (header.includes("ORP") || header.includes("RRP")) {
    return 128;
  }
  if (header === "Model name" || header === "Business Segment" || header === "Range Segmentation") {
    return 180;
  }
  if (
    header === "drag fill" ||
    header === "formula" ||
    header === "conditional formatting" ||
    header === "advanced filtering and sorting"
  ) {
    return 190;
  }
  return 120;
});

export const HANSON_ROW_HEIGHT = 64;

export const HANSON_LICENSE_KEY = "non-commercial-and-evaluation";
