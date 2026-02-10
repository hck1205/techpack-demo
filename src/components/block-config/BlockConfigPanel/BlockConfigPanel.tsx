import { useAtomValue, useSetAtom } from "jotai";
import {
  deleteSelectedBlockAtom,
  fabricInspectorAtom,
  fabricListInspectorAtom,
  selectedItemAtom,
  updateBlockConfigAtom,
} from "../../../state";
import type { BlockConfigMap, GridItem, ImagePosition } from "../../../types/blocks";
import { ConfigEmpty, ConfigField, ConfigFields, ConfigPanel, DeleteButton, PanelTitle } from "./BlockConfigPanel.styled";
import type { UpdateBlockConfigHandler } from "./BlockConfigPanel.types";

export function BlockConfigPanel() {
  const item = useAtomValue(selectedItemAtom);
  const fabricInspector = useAtomValue(fabricInspectorAtom);
  const fabricListInspector = useAtomValue(fabricListInspectorAtom);
  const updateBlockConfig = useSetAtom(updateBlockConfigAtom);
  const deleteSelectedBlock = useSetAtom(deleteSelectedBlockAtom);
  const onUpdate: UpdateBlockConfigHandler = (itemId, type, patch) => {
    updateBlockConfig({ itemId, type, patch });
  };

  if (fabricInspector) {
    return (
      <ConfigPanel data-fabric-list-deactivate-exempt="true">
        <PanelTitle>Block Config</PanelTitle>
        <ConfigFields>
          <ConfigField>
            <span>Image position</span>
            <select
              value={fabricInspector.imagePosition}
              onChange={(event) => fabricInspector.setImagePosition(event.target.value as ImagePosition)}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </ConfigField>
          <ConfigField>
            <span>Input count</span>
            <input
              type="number"
              min={1}
              max={50}
              value={fabricInspector.inputCount}
              onChange={(event) => fabricInspector.setInputCount(Number(event.target.value))}
            />
          </ConfigField>
          <ConfigField>
            <span>Cols</span>
            <input
              type="number"
              min={1}
              max={10}
              value={fabricInspector.cols}
              onChange={(event) => fabricInspector.setCols(Number(event.target.value))}
            />
          </ConfigField>
        </ConfigFields>
      </ConfigPanel>
    );
  }

  if (fabricListInspector) {
    return (
      <ConfigPanel data-fabric-list-deactivate-exempt="true">
        <PanelTitle>Block Config</PanelTitle>
        <ConfigFields>
          <ConfigField>
            <span>Input fields (active fabric)</span>
            <input
              type="number"
              min={1}
              max={20}
              value={fabricListInspector.activeInputCount}
              onChange={(event) => fabricListInspector.setActiveInputCount(Number(event.target.value))}
            />
          </ConfigField>
        </ConfigFields>
      </ConfigPanel>
    );
  }

  if (!item) {
    return (
      <ConfigPanel data-fabric-list-deactivate-exempt="true">
        <PanelTitle>Block Config</PanelTitle>
        <ConfigEmpty>Select a block to configure</ConfigEmpty>
      </ConfigPanel>
    );
  }

  return (
    <ConfigPanel data-fabric-list-deactivate-exempt="true">
      <PanelTitle>Block Config</PanelTitle>
      {item.type === "table" && <TableConfig item={item} onUpdate={onUpdate} />}
      {item.type === "react-table" && <ReactTableConfig item={item} onUpdate={onUpdate} />}
      {item.type === "construction" && <ConstructionConfig item={item} onUpdate={onUpdate} />}
      {item.type === "editor" && (
        <ConfigEmpty>Editor options moved into the active editor toolbar. Select the editor block to use them.</ConfigEmpty>
      )}
      {item.type === "fabric" && <FabricConfig item={item} onUpdate={onUpdate} />}
      {item.type === "fabric-list" && <FabricListConfig item={item} onUpdate={onUpdate} />}
      {item.type === "slot-layout" && <SlotLayoutConfig item={item} onUpdate={onUpdate} />}
      <DeleteButton
        type="button"
        onClick={() => {
          const ok = window.confirm("Delete this block?");
          if (!ok) return;
          deleteSelectedBlock();
        }}
      >
        Delete Block
      </DeleteButton>
    </ConfigPanel>
  );
}

function TableConfig({ item, onUpdate }: { item: GridItem; onUpdate: UpdateBlockConfigHandler }) {
  const config = item.config as BlockConfigMap["table"];

  return (
    <ConfigFields>
      <ConfigField>
        <span>Height</span>
        <input
          type="number"
          min={160}
          max={500}
          value={config.height}
          onChange={(event) => onUpdate(item.id, "table", { height: Number(event.target.value) || 240 })}
        />
      </ConfigField>
      <ConfigField className="checkbox">
        <input
          type="checkbox"
          checked={config.indicators}
          onChange={(event) => onUpdate(item.id, "table", { indicators: event.target.checked })}
        />
        <span>Show hidden indicators</span>
      </ConfigField>
    </ConfigFields>
  );
}

function ReactTableConfig({ item, onUpdate }: { item: GridItem; onUpdate: UpdateBlockConfigHandler }) {
  const config = item.config as BlockConfigMap["react-table"];

  return (
    <ConfigFields>
      <ConfigField>
        <span>Visible rows</span>
        <input
          type="number"
          min={1}
          max={20}
          value={config.rowLimit}
          onChange={(event) =>
            onUpdate(item.id, "react-table", { rowLimit: Math.max(1, Number(event.target.value) || 1) })
          }
        />
      </ConfigField>
    </ConfigFields>
  );
}

function ConstructionConfig({ item, onUpdate }: { item: GridItem; onUpdate: UpdateBlockConfigHandler }) {
  void item;
  void onUpdate;
  return <ConfigEmpty>Construction viewer options are currently fixed.</ConfigEmpty>;
}

function FabricConfig({ item, onUpdate }: { item: GridItem; onUpdate: UpdateBlockConfigHandler }) {
  const config = item.config as BlockConfigMap["fabric"];
  const legacyRows = (config as { rows?: number }).rows;
  const inputCountValue = Math.max(1, config.inputCount ?? legacyRows ?? 1);

  return (
    <ConfigFields>
      <ConfigField>
        <span>Image position</span>
        <select
          value={config.imagePosition}
          onChange={(event) =>
            onUpdate(item.id, "fabric", {
              imagePosition: event.target.value as ImagePosition,
            })
          }
        >
          <option value="left">Left</option>
          <option value="right">Right</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
        </select>
      </ConfigField>
      <ConfigField>
        <span>Input count</span>
        <input
          type="number"
          min={1}
          max={50}
          value={inputCountValue}
          onChange={(event) =>
            onUpdate(item.id, "fabric", { inputCount: Math.max(1, Number(event.target.value) || 1) })
          }
        />
      </ConfigField>
      <ConfigField>
        <span>Cols</span>
        <input
          type="number"
          min={1}
          max={10}
          value={config.cols}
          onChange={(event) => onUpdate(item.id, "fabric", { cols: Math.max(1, Number(event.target.value) || 1) })}
        />
      </ConfigField>
    </ConfigFields>
  );
}

function FabricListConfig({ item, onUpdate }: { item: GridItem; onUpdate: UpdateBlockConfigHandler }) {
  const config = item.config as BlockConfigMap["fabric-list"];
  const activeFabricIndex =
    typeof config.activeFabricIndex === "number" &&
    config.activeFabricIndex >= 1 &&
    config.activeFabricIndex <= Math.max(1, config.count)
      ? config.activeFabricIndex
      : null;
  const effectiveActiveFabricIndex = activeFabricIndex ?? 1;
  const inputCounts = config.inputCounts ?? [];
  const activeInputCount = Math.max(1, inputCounts[effectiveActiveFabricIndex - 1] ?? 2);

  const patchActiveInputCount = (nextCount: number) => {
    const sanitizedCount = Math.max(1, nextCount || 1);
    const nextInputCounts = Array.from({ length: Math.max(1, config.count) }, (_, index) => inputCounts[index] ?? 2);
    nextInputCounts[effectiveActiveFabricIndex - 1] = sanitizedCount;
    onUpdate(item.id, "fabric-list", {
      activeFabricIndex: effectiveActiveFabricIndex,
      inputCounts: nextInputCounts,
    });
  };

  return (
    <ConfigFields>
      <ConfigField>
        <span>Count</span>
        <input
          type="number"
          min={1}
          max={24}
          value={config.count}
          onChange={(event) => {
            const nextCount = Math.max(1, Number(event.target.value) || 1);
            const nextActiveFabricIndex = activeFabricIndex === null ? null : Math.min(activeFabricIndex, nextCount);
            const nextInputCounts = Array.from({ length: nextCount }, (_, index) => inputCounts[index] ?? 2);
            onUpdate(item.id, "fabric-list", {
              count: nextCount,
              activeFabricIndex: nextActiveFabricIndex,
              inputCounts: nextInputCounts,
            });
          }}
        />
      </ConfigField>
      <ConfigField>
        <span>Input fields (active fabric)</span>
        <input
          type="number"
          min={1}
          max={20}
          value={activeInputCount}
          onChange={(event) => patchActiveInputCount(Number(event.target.value))}
        />
      </ConfigField>
    </ConfigFields>
  );
}

function SlotLayoutConfig({ item, onUpdate }: { item: GridItem; onUpdate: UpdateBlockConfigHandler }) {
  const config = item.config as BlockConfigMap["slot-layout"];

  return (
    <ConfigFields>
      <ConfigField>
        <span>Area actions</span>
        <button
          type="button"
          onClick={() =>
            onUpdate(item.id, "slot-layout", {
              deleteAreaNonce: (config.deleteAreaNonce ?? 0) + 1,
            })
          }
        >
          Delete Area
        </button>
      </ConfigField>
    </ConfigFields>
  );
}
