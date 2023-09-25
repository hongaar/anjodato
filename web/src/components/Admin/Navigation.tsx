import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks";

export function Navigation() {
  console.debug("Rendering component Admin/Navigation");

  const { login, logout, user } = useAuth();
  const [location] = useLocation();

  return (
    <nav>
      <ul>
        <li>
          <Link
            className={location.startsWith("/admin/labels") ? "" : "secondary"}
            href="/admin/labels"
          >
            Labels
          </Link>
        </li>
        <li>
          <Link
            className={location.startsWith("/admin/updates") ? "" : "secondary"}
            href="/admin/updates"
          >
            Updates
          </Link>
        </li>
        <li>
          <Link
            className={
              location.startsWith("/admin/comments") ? "" : "secondary"
            }
            href="/admin/comments"
          >
            Comments
          </Link>
        </li>
        <li>{user ? user.name : "Log in to make edits"}</li>
        <li>
          {user ? (
            <button onClick={logout}>Logout</button>
          ) : (
            <button onClick={login}>Login</button>
          )}
        </li>
      </ul>
    </nav>
  );
}
