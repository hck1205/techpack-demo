import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Handsontable from "handsontable";
import {
  createHansonTableData,
  createHansonTableRow,
  type HansonConditionalOperator,
  type HansonConditionalRule,
  type HansonConditionalStyleKey,
  useHansonHandsontable,
} from "../modules/hansonTable";

export function HansonTablePage() {
  const INITIAL_ROW_COUNT = 400;
  const TARGET_ROW_COUNT = 10000;
  const APPEND_BATCH_SIZE = 200;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const hotRef = useRef<Handsontable | null>(null);
  const shortcutsRef = useRef<HTMLDetailsElement | null>(null);
  const shortcutsPanelRef = useRef<HTMLDivElement | null>(null);
  const conditionalRulesRef = useRef<HansonConditionalRule[]>([]);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isConditionalPanelOpen, setIsConditionalPanelOpen] = useState(false);
  const [shortcutsAlign, setShortcutsAlign] = useState<"align-left" | "align-right">("align-right");
  const [conditionalRules, setConditionalRules] = useState<HansonConditionalRule[]>([]);
  const [ruleColumnRef, setRuleColumnRef] = useState("C:C");
  const [ruleOperator, setRuleOperator] = useState<HansonConditionalOperator>("greaterThan");
  const [ruleValue1, setRuleValue1] = useState("150000");
  const [ruleValue2, setRuleValue2] = useState("");
  const [ruleStyleKey, setRuleStyleKey] = useState<HansonConditionalStyleKey>("green");
  const handleSelectionRangeChange = useCallback((rangeRef: string) => {
    setRuleColumnRef(rangeRef);
  }, []);

  const data = useMemo(() => createHansonTableData(INITIAL_ROW_COUNT), []);
  useHansonHandsontable(
    containerRef,
    data,
    hotRef,
    conditionalRulesRef,
    isConditionalPanelOpen ? handleSelectionRangeChange : undefined
  );

  useEffect(() => {
    conditionalRulesRef.current = conditionalRules;
    hotRef.current?.render();
  }, [conditionalRules]);

  useEffect(() => {
    let appendedCount = INITIAL_ROW_COUNT;
    const timer = window.setInterval(() => {
      const hot = hotRef.current;
      if (!hot) {
        return;
      }
      if (appendedCount >= TARGET_ROW_COUNT) {
        window.clearInterval(timer);
        return;
      }

      const nextCount = Math.min(TARGET_ROW_COUNT, appendedCount + APPEND_BATCH_SIZE);
      const appendSize = nextCount - appendedCount;
      const appendStart = appendedCount;
      const rows = Array.from({ length: appendSize }, (_, index) => createHansonTableRow(appendStart + index));

      hot.batch(() => {
        hot.alter("insert_row_below", hot.countRows() - 1, appendSize);
        hot.populateFromArray(appendStart, 0, rows);
      });

      appendedCount = nextCount;
    }, 120);

    return () => window.clearInterval(timer);
  }, []);

  const handleUndo = () => {
    const undoRedoPlugin = hotRef.current?.getPlugin("undoRedo") as
      | { undo?: () => void; redo?: () => void }
      | undefined;
    undoRedoPlugin?.undo?.();
  };

  const handleRedo = () => {
    const undoRedoPlugin = hotRef.current?.getPlugin("undoRedo") as
      | { undo?: () => void; redo?: () => void }
      | undefined;
    undoRedoPlugin?.redo?.();
  };

  const resolveShortcutsAlign = useCallback(() => {
    const detailsEl = shortcutsRef.current;
    const panelEl = shortcutsPanelRef.current;
    if (!detailsEl || !panelEl) {
      return;
    }

    const anchorRect = detailsEl.getBoundingClientRect();
    const panelWidth = panelEl.getBoundingClientRect().width || 320;
    const viewportWidth = window.innerWidth;

    const leftAlignedLeft = anchorRect.left;
    const leftAlignedRight = leftAlignedLeft + panelWidth;
    const leftAlignedOverflow =
      Math.max(0, -leftAlignedLeft) + Math.max(0, leftAlignedRight - viewportWidth);

    const rightAlignedRight = anchorRect.right;
    const rightAlignedLeft = rightAlignedRight - panelWidth;
    const rightAlignedOverflow =
      Math.max(0, -rightAlignedLeft) + Math.max(0, rightAlignedRight - viewportWidth);

    setShortcutsAlign(rightAlignedOverflow <= leftAlignedOverflow ? "align-right" : "align-left");
  }, []);

  useEffect(() => {
    if (!isShortcutsOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(resolveShortcutsAlign);
    const handleViewportChange = () => resolveShortcutsAlign();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    const observer = new ResizeObserver(() => resolveShortcutsAlign());
    if (shortcutsRef.current) {
      observer.observe(shortcutsRef.current);
    }
    if (shortcutsPanelRef.current) {
      observer.observe(shortcutsPanelRef.current);
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      observer.disconnect();
    };
  }, [isShortcutsOpen, resolveShortcutsAlign]);

  const requiresSecondValue = ruleOperator === "between";
  const requiresValue = !["isEmpty", "isNotEmpty"].includes(ruleOperator);

  const handleAddConditionalRule = () => {
    const normalizedColumnRef = ruleColumnRef.trim();
    if (!normalizedColumnRef) {
      return;
    }

    const newRule: HansonConditionalRule = {
      id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      enabled: true,
      columnRef: normalizedColumnRef,
      operator: ruleOperator,
      styleKey: ruleStyleKey,
      value1: requiresValue ? ruleValue1 : undefined,
      value2: requiresSecondValue ? ruleValue2 : undefined,
    };
    setConditionalRules((prev) => [newRule, ...prev]);
  };

  const handleDoneConditionalRule = () => {
    handleAddConditionalRule();
    setIsConditionalPanelOpen(false);
  };

  const describeRule = (rule: HansonConditionalRule): string => {
    const column = rule.columnRef.toUpperCase();
    if (rule.operator === "between") {
      return `${column} between ${rule.value1 ?? ""} and ${rule.value2 ?? ""}`;
    }
    if (rule.operator === "isEmpty") {
      return `${column} is empty`;
    }
    if (rule.operator === "isNotEmpty") {
      return `${column} is not empty`;
    }
    if (rule.operator === "containsText") {
      return `${column} contains "${rule.value1 ?? ""}"`;
    }
    if (rule.operator === "notContainsText") {
      return `${column} does not contain "${rule.value1 ?? ""}"`;
    }
    if (rule.operator === "greaterThan") {
      return `${column} > ${rule.value1 ?? ""}`;
    }
    if (rule.operator === "lessThan") {
      return `${column} < ${rule.value1 ?? ""}`;
    }
    return `${column} = ${rule.value1 ?? ""}`;
  };

  return (
    <div className="app-shell hanson-table-page-shell">
      <div className="hanson-sheet-top">
        <div className="hanson-sheet-menu">
          {["File", "Edit", "View", "Insert", "Format", "Data", "Tools", "Extensions", "Help"].map((item) => (
            <button key={item} type="button" className="hanson-sheet-menu-item" disabled>
              {item}
            </button>
          ))}
          <button
            type="button"
            className="hanson-sheet-icon-btn"
            onClick={handleUndo}
            aria-label="Undo"
            title="Undo (Ctrl/Cmd+Z)"
          >
            <svg className="hanson-sheet-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12.5 8c-2.65 0-5.04 1.01-6.86 2.64L3 8v7h7l-3.62-3.62A6.996 6.996 0 0 1 12.5 9c3.04 0 5.64 1.97 6.56 4.71l1.9-.62C19.78 9.53 16.45 7 12.5 7z" />
            </svg>
          </button>
          <button
            type="button"
            className="hanson-sheet-icon-btn"
            onClick={handleRedo}
            aria-label="Redo"
            title="Redo (Ctrl/Cmd+Y)"
          >
            <svg className="hanson-sheet-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11.5 8c2.65 0 5.04 1.01 6.86 2.64L21 8v7h-7l3.62-3.62A6.996 6.996 0 0 0 11.5 9c-3.04 0-5.64 1.97-6.56 4.71l-1.9-.62C4.22 9.53 7.55 7 11.5 7z" />
            </svg>
          </button>
          <button
            type="button"
            className="hanson-sheet-icon-btn"
            onClick={() => setIsConditionalPanelOpen((prev) => !prev)}
            aria-label="Conditional formatting"
            title="Conditional formatting"
          >
            fx
          </button>
          <details
            ref={shortcutsRef}
            className="hanson-shortcuts"
            onToggle={(event) => setIsShortcutsOpen((event.currentTarget as HTMLDetailsElement).open)}
          >
            <summary className="hanson-sheet-icon-btn" aria-label="Shortcuts" title="Keyboard shortcuts">
              ?
            </summary>
            <div ref={shortcutsPanelRef} className={`hanson-shortcuts-panel ${shortcutsAlign}`}>
              <div>Ctrl/Cmd + Z: Undo</div>
              <div>Ctrl/Cmd + Shift + Z / Ctrl/Cmd + Y: Redo</div>
              <div>Ctrl/Cmd + A: Select all</div>
              <div>Alt + Shift + ArrowRight: Group selected rows</div>
              <div>Alt + Shift + ArrowLeft: Ungroup selected rows</div>
              <div>Alt + Shift + ArrowDown: Collapse current group</div>
              <div>Alt + Shift + ArrowUp: Expand current group</div>
              <div>Ctrl/Cmd + Alt + =: Insert row below</div>
              <div>Ctrl/Cmd + Alt + -: Delete selected rows</div>
            </div>
          </details>
        </div>
      </div>
      <div className={`hanson-table-fill${isConditionalPanelOpen ? " has-cf-panel" : ""}`}>
        <div ref={containerRef} className="hanson-table-host" />
        {isConditionalPanelOpen ? (
          <aside className="hanson-cf-panel" role="complementary" aria-label="Conditional formatting sidebar">
            <div className="hanson-cf-panel-header">
              <strong>Conditional format rules</strong>
              <button type="button" className="hanson-cf-close-btn" onClick={() => setIsConditionalPanelOpen(false)}>
                ×
              </button>
            </div>
            <div className="hanson-cf-tabs">
              <button type="button" className="is-active">
                Single color
              </button>
              <button type="button" disabled>
                Color scale
              </button>
            </div>
            <div className="hanson-cf-grid">
              <div className="hanson-cf-section-title">Apply to range</div>
              <label className="hanson-cf-field">
                <div className="hanson-cf-range-row">
                  <input
                    value={ruleColumnRef}
                    onChange={(event) => setRuleColumnRef(event.target.value)}
                    placeholder="e.g. AG:AG, A:A, 33"
                  />
                  <button type="button" aria-label="Select range" title="Select range">
                    ▦
                  </button>
                </div>
              </label>
              <div className="hanson-cf-section-title">Format rules</div>
              <label className="hanson-cf-field">
                Format cells if...
                <select
                  value={ruleOperator}
                  onChange={(event) => setRuleOperator(event.target.value as HansonConditionalOperator)}
                >
                  <option value="greaterThan">Greater than</option>
                  <option value="lessThan">Less than</option>
                  <option value="between">Between</option>
                  <option value="equalTo">Is equal to</option>
                  <option value="containsText">Text contains</option>
                  <option value="notContainsText">Text does not contain</option>
                  <option value="isEmpty">Is empty</option>
                  <option value="isNotEmpty">Is not empty</option>
                </select>
              </label>
              {requiresValue ? (
                <label className="hanson-cf-field">
                  Value or formula
                  <input value={ruleValue1} onChange={(event) => setRuleValue1(event.target.value)} />
                </label>
              ) : null}
              {requiresSecondValue ? (
                <label className="hanson-cf-field">
                  Second value
                  <input value={ruleValue2} onChange={(event) => setRuleValue2(event.target.value)} />
                </label>
              ) : null}
              <div className="hanson-cf-section-title">Formatting style</div>
              <div className={`hanson-cf-style-preview hanson-cf-user-${ruleStyleKey}`}>Default</div>
              <label className="hanson-cf-field">
                Fill color
                <select
                  value={ruleStyleKey}
                  onChange={(event) => setRuleStyleKey(event.target.value as HansonConditionalStyleKey)}
                >
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="yellow">Yellow</option>
                  <option value="blue">Blue</option>
                  <option value="purple">Purple</option>
                </select>
              </label>
              <div className="hanson-cf-actions">
                <button type="button" className="hanson-cf-secondary-btn" onClick={handleAddConditionalRule}>
                  + Add another rule
                </button>
                <button type="button" className="hanson-cf-add-btn" onClick={handleDoneConditionalRule}>
                  Done
                </button>
              </div>
            </div>
            <div className="hanson-cf-section-title">Rules</div>
            <div className="hanson-cf-rule-list">
              {conditionalRules.length === 0 ? (
                <div className="hanson-cf-empty">No custom rules yet.</div>
              ) : (
                conditionalRules.map((rule) => (
                  <div key={rule.id} className="hanson-cf-rule-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(event) =>
                          setConditionalRules((prev) =>
                            prev.map((prevRule) =>
                              prevRule.id === rule.id
                                ? {
                                    ...prevRule,
                                    enabled: event.target.checked,
                                  }
                                : prevRule
                            )
                          )
                        }
                      />
                      {describeRule(rule)}
                    </label>
                    <button
                      type="button"
                      onClick={() => setConditionalRules((prev) => prev.filter((prevRule) => prevRule.id !== rule.id))}
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
