import { Link } from "wouter";
import { Collection } from "../api";
import { useCollection } from "../hooks";

export function Updates() {
  console.debug("Rendering page Updates");

  const updates = useCollection(Collection.Updates);

  return (
    <div className="updates">
      <h1>Updates</h1>
      <ul>
        {updates?.map((update) => (
          <li key={update.id}>
            <Link href={`/${update.id}`}>{update.description.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
