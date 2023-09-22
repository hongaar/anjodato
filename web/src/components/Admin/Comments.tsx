import { deleteDoc } from "firebase/firestore";
import { Collection, formatIso } from "../../api";
import { useAuth, useCollectionGroup } from "../../hooks";

export function Comments() {
  console.debug("Rendering component Admin/Comments");

  const { user } = useAuth();
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
              .sort((a, b) => (a.date > b.date ? 1 : -1))
              .map((comment) => (
                <tr key={comment.id}>
                  <th scope="row">{formatIso(comment.date)}</th>
                  <td>{comment.name}</td>
                  <td>{comment.comment}</td>
                  <td>
                    <div className="grid">
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
