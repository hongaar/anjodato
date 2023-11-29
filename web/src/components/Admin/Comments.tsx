import { deleteDoc } from "firebase/firestore";
import { useState } from "react";
import { Collection, formatIso } from "../../api";
import { useAuth, useCollectionGroup } from "../../hooks";
import { AddReply } from "./AddReply";

export function Comments() {
  console.debug("Rendering component Admin/Comments");

  const { user } = useAuth();
  const [replyOpen, setReplyOpen] = useState<string>();
  const comments = useCollectionGroup(Collection.Comments);

  if (!user) {
    return null;
  }

  return (
    <>
      <h3>Comments</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Name</th>
            <th scope="col">Comment</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments === null ? (
            <tr>
              <th scope="row" colSpan={4} aria-busy="true">
                Loading...
              </th>
            </tr>
          ) : comments.length > 0 ? (
            comments
              .sort((a, b) => (a.date > b.date ? -1 : 1))
              .map((comment) => (
                <>
                  <tr key={comment.id}>
                    <th scope="row">{formatIso(comment.date)}</th>
                    <td>{comment.name}</td>
                    <td
                      style={{
                        maxWidth: "20rem",
                      }}
                    >
                      {comment.comment}
                    </td>
                    <td>
                      <div className="grid">
                        <button
                          onClick={() => {
                            if (replyOpen === comment.id) {
                              setReplyOpen(undefined);
                            } else {
                              setReplyOpen(comment.id);
                            }
                          }}
                        >
                          {replyOpen === comment.id ? "Cancel" : "Reply"}
                        </button>
                        <button
                          onClick={async () => {
                            if (
                              prompt(
                                'If you really want to delete this comment, type "yes"',
                                "no",
                              ) === "yes"
                            ) {
                              deleteDoc(comment._ref);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {replyOpen === comment.id ? (
                    <tr>
                      <td colSpan={4}>
                        <AddReply
                          comment={comment}
                          onSubmit={() => setReplyOpen(undefined)}
                        />
                      </td>
                    </tr>
                  ) : null}
                </>
              ))
          ) : (
            <tr>
              <th scope="row" colSpan={4}>
                No comments
              </th>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
