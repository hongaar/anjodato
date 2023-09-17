import { Link } from "wouter";
import { useAuth } from "../../hooks";

export function Navigation() {
  console.debug("Rendering component Admin/Navigation");

  const { login, logout, user } = useAuth();

  return (
    <nav>
      <ul>
        <li>{user ? user.name : "not logged in"}</li>
      </ul>
      <ul>
        <li>
          <Link href="/admin/labels">Labels</Link>
        </li>
        <li>
          <Link href="/admin/updates">Updates</Link>
        </li>
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
