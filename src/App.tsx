import { Navigate, Route, Routes } from "react-router-dom";
import { LayoutPage } from "./pages/LayoutPage";
import { GridPage } from "./pages/GridPage";
import { DndPage } from "./pages/DndPage";
import "./App.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import "@excalidraw/excalidraw/index.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LayoutPage />} />
        <Route path="/grid" element={<GridPage />} />
        <Route path="/dnd" element={<DndPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
