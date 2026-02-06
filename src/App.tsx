import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { EditorPage } from "./pages/EditorPage";
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
      <nav className="route-nav">
        <NavLink to="/" end className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
          Editor
        </NavLink>
        <NavLink to="/grid" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
          Grid
        </NavLink>
        <NavLink to="/dnd" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
          DnD
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/grid" element={<GridPage />} />
        <Route path="/dnd" element={<DndPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
