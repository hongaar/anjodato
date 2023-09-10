import { Link } from "wouter";
import { Collection } from "../api";
import { useCollection } from "../hooks";

export function Workshops() {
  console.debug("Rendering Workshops");

  const workshops = useCollection(Collection.Workshops);

  return (
    <div className="workshops">
      <h1>Workshops</h1>
      <ul>
        {workshops?.map((doc) => (
          <li key={doc.id}>
            <Link href={`/${doc.id}`}>{doc.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
