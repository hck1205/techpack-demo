import { NavLink } from "react-router-dom";

export function FloatingRouteNav() {
  return (
    <nav className="route-nav route-nav-inline" aria-label="Page navigation">
      <NavLink to="/" end className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
        SlotLayout
      </NavLink>
      <NavLink to="/dnd" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
        Guide
      </NavLink>
      <NavLink to="/grid" className={({ isActive }) => `route-nav-link ${isActive ? "is-active" : ""}`}>
        Grid
      </NavLink>
    </nav>
  );
}
