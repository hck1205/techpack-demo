import { useState } from "react";
import { defaultBlockConfig } from "../config/blocks";
import { NavLink } from "react-router-dom";
import { BlockConfigPanel } from "../components/block-config";
import { BlockLibraryPanel } from "../components/block-library";
import { SlidesPanel } from "../components/slides";
import { LoadLayoutsModal, StorageToolbar } from "../components/storage";
import { SlotLayout } from "../modules/blocks/SlotLayout";
import type { BlockConfigMap } from "../types/blocks";

export function LayoutPage() {
  const [config, setConfig] = useState<BlockConfigMap["slot-layout"]>(
    () => defaultBlockConfig("slot-layout") as BlockConfigMap["slot-layout"]
  );
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(true);

  return (
    <div className="app-shell layout-page-shell">
      <SlidesPanel />

      <main className="editor-panel">
        <div className={`editor-body ${isToolPanelOpen ? "tools-open" : "tools-collapsed"}`}>
          <div className={`left-panel-wrapper ${isToolPanelOpen ? "is-open" : "is-collapsed"}`}>
            <button
              className="left-panel-toggle"
              onClick={() => setIsToolPanelOpen((prev) => !prev)}
              aria-label={isToolPanelOpen ? "Collapse tools panel" : "Expand tools panel"}
            >
              {isToolPanelOpen ? "◀" : "▶"}
            </button>
            {isToolPanelOpen ? (
              <aside className="left-panel" data-fabric-list-deactivate-exempt="true">
                <nav className="route-nav route-nav-inline">
                  <NavLink to="/" end className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
                    SlotLayout
                  </NavLink>
                  <NavLink to="/dnd" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
                    Ruler
                  </NavLink>
                  <NavLink to="/grid" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
                    Grid
                  </NavLink>
                </nav>
                <StorageToolbar />
                <BlockLibraryPanel />
                <BlockConfigPanel />
              </aside>
            ) : null}
          </div>

          <section className="canvas-panel">
            <div className="canvas-drop-zone layout-canvas">
              <SlotLayout
                config={config}
                onConfigPatch={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </section>
        </div>
      </main>

      <LoadLayoutsModal />
    </div>
  );
}
