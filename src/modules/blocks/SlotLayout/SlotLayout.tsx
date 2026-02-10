import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pane, SplitPane } from "react-split-pane";
import { BLOCKS, defaultBlockConfig } from "../../../config/blocks";
import { BlockCard } from "../../../components/block-card/BlockCard";
import { createBlockShellStyle } from "../shared/blockShell";
import type { SlotLayoutProps, SlotPaneBlock } from "./SlotLayout.types";

type SlotNode =
  | {
      id: string;
      kind: "leaf";
      pane: SlotPaneBlock | null;
    }
  | {
      id: string;
      kind: "split";
      direction: "vertical" | "horizontal";
      ratio: number;
      first: SlotNode;
      second: SlotNode;
    };

export function SlotLayout({ config, onConfigPatch, className, style }: SlotLayoutProps) {
  const nodeCountRef = useRef(0);
  const nextNodeId = () => `slot-layout-node-${nodeCountRef.current++}`;
  const createLeafNode = (pane: SlotPaneBlock | null = null): SlotNode => ({
    id: nextNodeId(),
    kind: "leaf",
    pane,
  });

  const splitPercent = useMemo(() => Math.min(95, Math.max(5, config.defaultSize)), [config.defaultSize]);
  const selectableBlocks = useMemo(() => BLOCKS.filter((block) => block.type !== "slot-layout"), []);
  const [rootNode, setRootNode] = useState<SlotNode>(() => createLeafNode());
  const [pickerLeafId, setPickerLeafId] = useState<string | null>(null);
  const [activeLeafId, setActiveLeafId] = useState<string | null>(null);
  const lastDeleteNonceRef = useRef(config.deleteAreaNonce);

  const mapNode = (node: SlotNode, updater: (current: SlotNode) => SlotNode): SlotNode => {
    const nextNode = updater(node);
    if (nextNode !== node) return nextNode;
    if (node.kind === "leaf") return node;
    const nextFirst = mapNode(node.first, updater);
    const nextSecond = mapNode(node.second, updater);
    if (nextFirst === node.first && nextSecond === node.second) return node;
    return { ...node, first: nextFirst, second: nextSecond };
  };

  const splitLeaf = (leafId: string, direction: "vertical" | "horizontal") => {
    onConfigPatch?.({ split: direction });
    setRootNode((prev) =>
      mapNode(prev, (current) => {
        if (current.kind !== "leaf" || current.id !== leafId) return current;
        return {
          id: nextNodeId(),
          kind: "split",
          direction,
          ratio: splitPercent,
          first: createLeafNode(current.pane),
          second: createLeafNode(),
        };
      })
    );
    setPickerLeafId(null);
  };

  const assignBlockToLeaf = (leafId: string, type: SlotPaneBlock["type"]) => {
    setRootNode((prev) =>
      mapNode(prev, (current) => {
        if (current.kind !== "leaf" || current.id !== leafId) return current;
        return {
          ...current,
          pane: {
            type,
            createdAt: Date.now(),
          },
        };
      })
    );
    setPickerLeafId(null);
  };

  const removeLeafNode = (node: SlotNode, leafId: string): SlotNode | null => {
    if (node.kind === "leaf") {
      return node.id === leafId ? null : node;
    }

    const nextFirst = removeLeafNode(node.first, leafId);
    const nextSecond = removeLeafNode(node.second, leafId);

    if (!nextFirst && !nextSecond) return null;
    if (!nextFirst) return nextSecond;
    if (!nextSecond) return nextFirst;

    if (nextFirst === node.first && nextSecond === node.second) return node;
    return { ...node, first: nextFirst, second: nextSecond };
  };

  const deleteLeaf = (leafId: string) => {
    setRootNode((prev) => removeLeafNode(prev, leafId) ?? createLeafNode());
    setPickerLeafId((prev) => (prev === leafId ? null : prev));
    setActiveLeafId((prev) => (prev === leafId ? null : prev));
  };

  useEffect(() => {
    const nextNonce = config.deleteAreaNonce;
    if (nextNonce === lastDeleteNonceRef.current) return;
    lastDeleteNonceRef.current = nextNonce;
    if (activeLeafId) deleteLeaf(activeLeafId);
  }, [activeLeafId, config.deleteAreaNonce]);

  const updateSplitRatio = (splitId: string, sizes: number[]) => {
    const first = sizes[0] ?? 0;
    const second = sizes[1] ?? 0;
    const total = first + second;
    if (total <= 0) return;
    const ratio = Math.min(95, Math.max(5, Math.round((first / total) * 100)));
    onConfigPatch?.({ defaultSize: ratio });
    setRootNode((prev) =>
      mapNode(prev, (current) => {
        if (current.kind !== "split" || current.id !== splitId) return current;
        return { ...current, ratio };
      })
    );
  };

  const renderLeaf = (leaf: Extract<SlotNode, { kind: "leaf" }>) => (
    <section
      className={`slot-layout-pane ${activeLeafId === leaf.id ? "is-active" : ""}`}
      onMouseDown={() => setActiveLeafId(leaf.id)}
    >
      <button
        type="button"
        className="slot-layout-pane-close"
        aria-label="Remove area"
        onClick={(event) => {
          event.stopPropagation();
          deleteLeaf(leaf.id);
        }}
      >
        ×
      </button>
      {!leaf.pane ? (
        <div className="slot-layout-pane-tools">
          <button
            className="slot-layout-pane-split-btn slot-layout-pane-split-btn-top"
            onClick={() => splitLeaf(leaf.id, "vertical")}
            aria-label="Split top and bottom"
          >
            ↑
          </button>
          <button
            className="slot-layout-pane-split-btn slot-layout-pane-split-btn-right"
            onClick={() => splitLeaf(leaf.id, "horizontal")}
            aria-label="Split left and right"
          >
            →
          </button>
          <button
            className="slot-layout-pane-split-btn slot-layout-pane-split-btn-bottom"
            onClick={() => splitLeaf(leaf.id, "vertical")}
            aria-label="Split top and bottom"
          >
            ↓
          </button>
          <button
            className="slot-layout-pane-split-btn slot-layout-pane-split-btn-left"
            onClick={() => splitLeaf(leaf.id, "horizontal")}
            aria-label="Split left and right"
          >
            ←
          </button>
        </div>
      ) : null}

      {leaf.pane ? (
        <div className="slot-layout-pane-content">
          <BlockCard type={leaf.pane.type} config={defaultBlockConfig(leaf.pane.type)} isActive={false} />
        </div>
      ) : (
        <div className="slot-layout-pane-empty-actions">
          <button className="slot-layout-pane-add" onClick={() => setPickerLeafId(leaf.id)}>
            +
          </button>
        </div>
      )}
    </section>
  );

  const renderSplitTree = (node: SlotNode): ReactNode => {
    if (node.kind === "leaf") {
      return renderLeaf(node);
    }

    return (
      <SplitPane
        key={node.id}
        direction={node.direction}
        dividerClassName="slot-layout-resizer"
        onResizeEnd={(sizes) => updateSplitRatio(node.id, sizes)}
      >
        <Pane defaultSize={`${node.ratio}%`}>{renderSplitTree(node.first)}</Pane>
        <Pane>{renderSplitTree(node.second)}</Pane>
      </SplitPane>
    );
  };

  return (
    <div className={["slot-layout-shell", className].filter(Boolean).join(" ")} style={createBlockShellStyle(style)}>
      <div className="slot-layout-split-root">{renderSplitTree(rootNode)}</div>
      {pickerLeafId !== null
        ? createPortal(
            <div className="slot-layout-picker-overlay" onClick={() => setPickerLeafId(null)}>
              <div className="slot-layout-picker-modal" onClick={(event) => event.stopPropagation()}>
                <div className="slot-layout-picker-title">Choose a block</div>
                <div className="slot-layout-picker-list">
                  {selectableBlocks.map((block) => (
                    <button
                      key={block.type}
                      className="slot-layout-picker-item"
                      onClick={() => assignBlockToLeaf(pickerLeafId, block.type as SlotPaneBlock["type"])}
                    >
                      {block.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
