import { FormEvent, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Collection, DocWithId } from "../../api";
import {
  useAuth,
  useCollection,
  useDocDeleter,
  useDocWriter,
} from "../../hooks";

export function Labels() {
  console.debug("Rendering component Admin/Labels");

  const { user } = useAuth();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emojiInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState<DocWithId<Collection.Labels> | null>(null);
  const labels = useCollection(Collection.Labels);
  const deleteLabel = useDocDeleter(Collection.Labels);
  const writeLabel = useDocWriter(Collection.Labels);

  useEffect(() => {
    if (label) {
      if (emojiInputRef.current) emojiInputRef.current.value = label.emoji;
      if (nameInputRef.current) nameInputRef.current.value = label.name;
    }
  }, [label]);

  async function addLabel(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as any);

    await writeLabel(label ? label.id : uuidv4(), {
      emoji: data.get("emoji") as string,
      name: data.get("name") as string,
    });

    setLabel(null);

    if (emojiInputRef.current) emojiInputRef.current.value = "";
    if (nameInputRef.current) nameInputRef.current.value = "";
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <h3>Labels</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {labels === null ? (
            <tr>
              <th scope="row" colSpan={2} aria-busy="true">
                Loading...
              </th>
            </tr>
          ) : labels.length > 0 ? (
            labels
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((label) => (
                <tr key={label.id}>
                  <th scope="row">
                    {label.emoji ? (
                      <span className="emoji">{label.emoji} </span>
                    ) : null}
                    {label.name}
                  </th>
                  <td>
                    <div className="grid">
                      <button onClick={() => setLabel(label)}>Edit</button>
                      <button
                        onClick={async () => {
                          if (
                            prompt(
                              'If you really want to delete this label, type "yes"',
                              "no",
                            ) === "yes"
                          ) {
                            deleteLabel(label.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <th scope="row" colSpan={2}>
                No labels
              </th>
            </tr>
          )}
        </tbody>
      </table>
      <h3>{label ? "Edit label" : "Add label"}</h3>
      <form onSubmit={addLabel}>
        <div className="grid">
          <label>
            Emoji:
            <input
              name="emoji"
              ref={emojiInputRef}
              maxLength={4}
              className="emoji"
            />
          </label>
          <label>
            Name:
            <input name="name" ref={nameInputRef} required />
          </label>
        </div>
        <div className="grid">
          <button type="submit">{label ? "Edit label" : "Add label"}</button>
          {label ? (
            <button onClick={() => setLabel(null)}>Cancel</button>
          ) : null}
        </div>
      </form>
    </>
  );
}
