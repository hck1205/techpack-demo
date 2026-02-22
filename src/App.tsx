import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { TopRouteNav } from "./components/navigation/TopRouteNav";
import { LayoutPage } from "./pages/LayoutPage";
import { GridPage } from "./pages/GridPage";
import { DndPage } from "./pages/DndPage";
import { FreePage } from "./pages/FreePage";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import "@excalidraw/excalidraw/index.css";

const HansonTablePage = lazy(async () => {
  const module = await import("./pages/HansonTablePage");
  return { default: module.HansonTablePage };
});

function App() {
  return (
    <div className="app-root">
      <TopRouteNav />
      <div className="app-route-content">
        <Routes>
          <Route path="/" element={<Navigate to="/techpack" replace />} />
          <Route path="/techpack" element={<LayoutPage />} />
          <Route
            path="/handsontable"
            element={
              <Suspense fallback={<div className="hanson-route-loading">Loading table...</div>}>
                <HansonTablePage />
              </Suspense>
            }
          />
          <Route path="/grid" element={<GridPage />} />
          <Route path="/dnd" element={<DndPage />} />
          <Route path="/free" element={<FreePage />} />
          <Route path="*" element={<Navigate to="/techpack" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
