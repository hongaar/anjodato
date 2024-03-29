import { addSeconds } from "date-fns";
import { FormEvent, MouseEvent, useRef, useState } from "react";
import nl2br from "react-nl2br";
import { useLocalStorage } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { Collection, dateFormat } from "../../api";
import { useCollectionOnce, useDocDeleter, useDocWriter } from "../../hooks";

type Props = {
  updateId: string;
};

const DELETE_GRACE_SECONDS = 60 * 60;

export function Footer({ updateId }: Props) {
  console.debug("Rendering component Blog/Footer");

  const path = [Collection.Updates, updateId, Collection.Comments] as const;
  const [comments, reload] = useCollectionOnce(...path);
  const [inReplyTo, setInReplyTo] = useState<{ id: string; name: string }>();
  const writeComment = useDocWriter(...path);
  const deleteComment = useDocDeleter(...path);
  const [name, setName] = useLocalStorage("name", "");
  const [locallyCreated, setLocallyCreated] = useLocalStorage(
    "comments",
    [] as string[],
  );
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  async function addComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as any);

    submitButtonRef.current?.setAttribute("aria-busy", "true");
    try {
      const id = uuidv4();
      await writeComment(id, {
        date: new Date(),
        name: data.get("name") as string,
        comment: data.get("comment") as string,
        ...(inReplyTo ? { in_reply_to: inReplyTo.id } : {}),
      });
      setLocallyCreated([...locallyCreated, id]);
    } catch (error) {
      alert("Er ging iets fout, probeer je het later nog eens?");
      console.error(error);
    }
    await reload?.();
    if (commentRef.current) {
      commentRef.current.value = "";
    }
    setInReplyTo(undefined);
    submitButtonRef.current?.setAttribute("aria-busy", "false");
  }

  const makeDeleteComment =
    (commentId: string) => async (e: MouseEvent<HTMLButtonElement>) => {
      const target = e.currentTarget;
      target.setAttribute("aria-busy", "true");
      try {
        await deleteComment(commentId);
        setLocallyCreated(
          locallyCreated.filter((comment) => comment !== commentId),
        );
      } catch (error) {
        alert(
          "Je kan je reactie alleen verwijderen binnen 1 uur nadat je deze hebt geschreven.",
        );
        console.error(error);
      }
      await reload?.();
      target.setAttribute("aria-busy", "false");
    };

  return (
    <footer>
      <div>
        <h3>Reacties</h3>
        <div className="grid">
          {comments === null ? (
            <span aria-busy="true">Aan het laden...</span>
          ) : comments.length > 0 ? (
            <ol className="comments">
              {comments
                .sort((a, b) => (a.date > b.date ? 1 : -1))
                .filter((comment) => !comment.in_reply_to)
                .map((comment) => (
                  <li key={comment.id}>
                    <small>
                      Door <strong>{comment.name}</strong> op{" "}
                      <strong>{dateFormat(comment.date)}</strong>
                    </small>
                    <br />
                    {nl2br(comment.comment)}{" "}
                    <button
                      className="reply link inline"
                      type="button"
                      onClick={() =>
                        setInReplyTo({ id: comment.id, name: comment.name })
                      }
                    >
                      Reageer
                    </button>
                    {locallyCreated.includes(comment.id) &&
                    addSeconds(comment.date, DELETE_GRACE_SECONDS) >
                      new Date() ? (
                      <>
                        <br />
                        <button
                          className="link"
                          type="button"
                          onClick={makeDeleteComment(comment.id)}
                        >
                          Verwijder reactie
                        </button>
                      </>
                    ) : null}
                    <ol>
                      {comments
                        .sort((a, b) => (a.date > b.date ? 1 : -1))
                        .filter((reply) => reply.in_reply_to === comment.id)
                        .map((comment) => (
                          <li key={comment.id}>
                            <small>
                              Door <strong>{comment.name}</strong> op{" "}
                              <strong>{dateFormat(comment.date)}</strong>
                            </small>
                            <br />
                            {nl2br(comment.comment)}
                            {locallyCreated.includes(comment.id) &&
                            addSeconds(comment.date, DELETE_GRACE_SECONDS) >
                              new Date() ? (
                              <>
                                <br />
                                <button
                                  className="link"
                                  type="button"
                                  onClick={makeDeleteComment(comment.id)}
                                >
                                  Verwijder reactie
                                </button>
                              </>
                            ) : null}
                          </li>
                        ))}
                    </ol>
                  </li>
                ))}
            </ol>
          ) : (
            <p>Nog geen reacties</p>
          )}
          <div>
            <form onSubmit={addComment}>
              {inReplyTo ? (
                <aside>
                  <small>
                    Schrijf reactie op <strong>{inReplyTo.name}</strong>:{" "}
                  </small>
                  <button
                    className="inline outline secondary"
                    type="button"
                    onClick={() => setInReplyTo(undefined)}
                  >
                    ❌ Annuleren
                  </button>
                </aside>
              ) : null}
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
          </div>
        </div>
      </div>
    </footer>
  );
}
