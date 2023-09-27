import { Link } from "wouter";

export function Nav() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">✍️ Blog</Link>
        </li>
        <li>
          <Link href="/kaart">🗺️ Kaart</Link>
        </li>
        <li>
          <Link href="/reacties">❤️ Reacties</Link>
        </li>
        <li>
          <Link href="/admin">🔒 α</Link>
        </li>
      </ul>
    </nav>
  );
}
