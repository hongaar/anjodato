import { FormEvent, useRef } from "react";
import { useLocalStorage } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { AddIdAndRef, Collection, Comment } from "../../api";
import { useAuth, useDocWriter } from "../../hooks";

export function AddReply({
  comment,
  onSubmit,
}: {
  comment: AddIdAndRef<Comment>;
  onSubmit: () => void;
}) {
  console.debug("Rendering component Admin/AddComment");

  const { user } = useAuth();
  const path = [
    Collection.Updates,
    comment._ref.parent!.parent!.id,
    Collection.Comments,
  ] as const;
  const writeComment = useDocWriter(...path);
  const [name, setName] = useLocalStorage("name", "");
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  if (!user) {
    return null;
  }

  async function addReply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as any);

    submitButtonRef.current?.setAttribute("aria-busy", "true");
    try {
      const id = uuidv4();
      await writeComment(id, {
        date: new Date(),
        name: data.get("name") as string,
        comment: data.get("comment") as string,
        in_reply_to: comment.id,
      });
    } catch (error) {
      alert("Er ging iets fout, probeer je het later nog eens?");
      console.error(error);
    }
    // if (commentRef.current) {
    //   commentRef.current.value = "";
    // }
    submitButtonRef.current?.setAttribute("aria-busy", "false");
    onSubmit();
  }

  return (
    <>
      <h3>Reply</h3>
      <form onSubmit={addReply}>
        <label>
          <span className="visually-hidden">Naam</span>
          <input
            name="name"
            placeholder="Naam"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          <span className="visually-hidden">Reactie</span>
          <textarea
            ref={commentRef}
            rows={3}
            name="comment"
            placeholder="Reactie"
            required
          />
        </label>
        <button ref={submitButtonRef} type="submit">
          Verstuur
        </button>
      </form>
    </>
  );
}
