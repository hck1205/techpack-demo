import { NavLink } from "react-router-dom";

export function TopRouteNav() {
  return (
    <header className="top-route-bar">
      <nav className="route-nav top-route-nav" aria-label="Route navigation">
        <NavLink to="/techpack" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
          techpack
        </NavLink>
        <NavLink to="/handsontable" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
          handsontable
        </NavLink>
      </nav>
    </header>
  );
}
