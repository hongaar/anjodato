import { useAuth } from "../../hooks";

export function User() {
  console.debug("Rendering component User");

  const { login, logout, user } = useAuth();

  return (
    <div>
      {user === null && <button onClick={login}>Login</button>}
      {user !== null && (
        <p>
          {user.name} <button onClick={logout}>Logout</button>
        </p>
      )}
    </div>
  );
}
