import { useEffect, useMemo, useRef } from "react";
import Handsontable from "handsontable";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

const ROW_COUNT = 10000;
const BASE_TEXT =
  "Ultra high-resolution garment reference image used for stress-testing large text payload rendering in grid cells.";

export function HansonTablePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const data = useMemo(() => {
    return Array.from({ length: ROW_COUNT }, (_, rowIndex) => {
      const imageId = `IMG-${String(rowIndex + 1).padStart(6, "0")}`;
      const variation = rowIndex % 97;
      const width = 1200 + (rowIndex % 12) * 80;
      const height = 1600 + (rowIndex % 10) * 70;
      const longDescription =
        `${BASE_TEXT} ${BASE_TEXT} ${BASE_TEXT} Variant ${variation}. ` +
        `Source category: Lookbook-${rowIndex % 15}, season: 2026-S${(rowIndex % 4) + 1}.`;
      const imageSeed = `techpack-${imageId.toLowerCase()}`;
      const imageUrl = `https://picsum.photos/seed/${imageSeed}/1200/1600`;
      const thumbnailUrl = `https://picsum.photos/seed/${imageSeed}/320/180`;

      return [
        imageId,
        imageUrl,
        thumbnailUrl,
        `${imageId} front-view model wearing technical outerwear, studio lighting variation ${variation}`,
        longDescription,
        `tag-${rowIndex % 11},tag-${rowIndex % 13},tag-${rowIndex % 17},material-nylon,fit-relaxed`,
        `{\"width\":${width},\"height\":${height},\"camera\":\"A7R${(rowIndex % 5) + 3}\",\"iso\":${100 + (rowIndex % 8) * 100},\"batch\":\"B-${(rowIndex % 42) + 1}\"}`,
        `b64_sim_${imageId}_${"abcdef1234567890".repeat(10)}`,
      ];
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const thumbnailRenderer = (...args: unknown[]) => {
      const td = args[1] as HTMLTableCellElement;
      const row = args[2] as number;
      const value = args[5];

      Handsontable.dom.empty(td);
      td.className = "htCenter htMiddle";

      const src = typeof value === "string" ? value : "";
      const img = document.createElement("img");
      img.className = "hanson-table-thumb";
      img.src = src;
      img.alt = `row-${row}-thumbnail`;
      img.loading = "lazy";
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.onerror = () => {
        img.style.visibility = "hidden";
      };

      td.appendChild(img);
      return td;
    };

    const hot = new Handsontable(containerRef.current, {
      themeName: "ht-theme-main",
      data,
      rowHeaders: true,
      colHeaders: [
        "Image ID",
        "Image URL",
        "Thumbnail URL",
        "Alt Text",
        "Long Description",
        "Tags",
        "Metadata JSON",
        "Payload",
      ],
      width: "100%",
      height: "100%",
      stretchH: "all",
      rowHeights: 64,
      colWidths: [120, 280, 140, 300, 500, 280, 320, 300],
      columns: [
        { type: "text" },
        { type: "text" },
        { renderer: thumbnailRenderer, readOnly: true },
        { type: "text" },
        { type: "text" },
        { type: "text" },
        { type: "text" },
        { type: "text" },
      ],
      selectionMode: "multiple",
      manualColumnResize: true,
      licenseKey: "non-commercial-and-evaluation",
    });

    return () => {
      hot.destroy();
    };
  }, [data]);

  return (
    <div className="app-shell hanson-table-page-shell">
      <div className="hanson-table-fill">
        <div ref={containerRef} className="hanson-table-host" />
      </div>
    </div>
  );
}
