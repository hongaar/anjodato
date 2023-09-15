import { FormEvent } from "react";
import { Collection } from "../../api/schema";
import { useAuth, useCollection, useDocWriter } from "../../hooks";

export function Updates() {
  console.debug("Rendering component Updates");

  const { user } = useAuth();
  const updates = useCollection(Collection.Updates);
  const writeUpdate = useDocWriter(Collection.Updates);

  function addUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as any);

    writeUpdate(data.get("geo") as string, {
      location: {
        geo: data.get("geo") as string,
      },
      description: {
        title: data.get("title") as string,
        body: data.get("body") as string,
      },
      photos: {
        album: data.get("album") as string,
      },
    });
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <h2>Updates</h2>
      <form onSubmit={addUpdate}>
        <fieldset>
          <legend>Location:</legend>
          <label htmlFor="geo">Geo:</label>
          <input id="geo" name="geo" required type="text" />
        </fieldset>
        <fieldset>
          <legend>Description:</legend>
          <label htmlFor="title">Title:</label>
          <textarea id="title" name="title" required />
          <label htmlFor="body">Body:</label>
          <textarea id="body" name="body" required />
        </fieldset>
        <fieldset>
          <legend>Photos:</legend>
          <label htmlFor="album">Album:</label>
          <input id="album" name="album" required type="text" />
        </fieldset>
        <button type="submit">Add update</button>
      </form>
      <table>
        <tbody>
          {updates.map((update) => (
            <tr key={update.id}>
              <td>{update.description?.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
