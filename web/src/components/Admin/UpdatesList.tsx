import { MouseEvent } from "react";
import { useLocation } from "wouter";
import { getAllPhotos } from "../../api";
import { Collection, DocWithId } from "../../api/schema";
import {
  useAuth,
  useCollection,
  useDocDeleter,
  useDocWriter,
  useGapi,
} from "../../hooks";
import {
  useListFiles,
  useRemoveFile,
  useUploadFile,
} from "../../hooks/useStorage";

export function UpdatesList() {
  console.debug("Rendering component Admin/UpdatesList");

  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { isAuthorized, authorize, unauthorize, client } = useGapi();
  const updates = useCollection(Collection.Updates);
  const writeUpdate = useDocWriter(Collection.Updates);
  const deleteUpdate = useDocDeleter(Collection.Updates);
  const { remove } = useRemoveFile();
  const { list } = useListFiles();
  const { upload } = useUploadFile();

  if (!user) {
    return null;
  }

  const loadPhotos =
    (update: DocWithId<Collection.Updates>) =>
    async (e: MouseEvent<HTMLButtonElement>) => {
      if (!client || !update.photos.album) {
        return;
      }

      const target = e.currentTarget;

      target.setAttribute("aria-busy", "true");

      try {
        const photos = await getAllPhotos(client, update.photos.album.id);

        if (photos) {
          // Clean up directory
          const files = await list(`images/${update.id}`);
          await Promise.all(files.map((file) => remove(file.fullPath)));

          // Iterate Google Photos album, upload each photo to Firebase Storage
          await Promise.all(
            photos.map(async (photo) => {
              const photoUrl = `${photo.baseUrl!}=w3840`;
              // Can't just fetch because of CORS
              const photoBlob = await fetch(photoUrl).then((res) => res.blob());
              return upload(
                `images/${update.id}/${photo.filename}`,
                photoBlob,
                {
                  contentType: photo.mimeType,
                },
              );
            }),
          );

          writeUpdate(update.id, {
            photos: {
              album: update.photos.album,
              items: photos.map((photo) => {
                return {
                  id: photo.id as string,
                  url: photo.productUrl as string,
                  thumb_url: photo.baseUrl as string,
                  image_url: photo.baseUrl as string,
                  height: parseInt(photo.mediaMetadata?.height as string, 10),
                  width: parseInt(photo.mediaMetadata?.width as string, 10),
                  created_on:
                    (photo.mediaMetadata?.creationTime as string) || "",
                };
              }),
            },
          });
        }
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "status" in error &&
          error.status === 401
        ) {
          alert("Please re-authorize...");
          unauthorize();
        } else {
          target.setAttribute("aria-busy", "false");
          throw error;
        }
      }

      target.setAttribute("aria-busy", "false");
    };

  return (
    <>
      <h3>Updates</h3>
      <table>
        <thead>
          <tr>
            <th scope="col">Blog</th>
            <th scope="col">Album</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {updates && updates.length > 0 ? (
            updates
              .sort((a, b) => (a.date.start > b.date.start ? 1 : -1))
              .map((update) => (
                <tr key={update.id}>
                  <th scope="row">
                    {update.date.start}
                    <br />
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${update.location.place_id}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {update.location.name}{" "}
                    </a>
                    <br />
                    {update.description.title}
                  </th>
                  <td>
                    <a
                      href={update.photos.album?.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {update.photos.album?.name}
                    </a>
                    <br /> ({update.photos.items.length} photos)
                  </td>
                  <td>
                    <div className="grid">
                      <button
                        onClick={() => setLocation(`/updates/${update.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (
                            prompt(
                              'If you really want to delete this blog, type "yes"',
                              "no",
                            ) === "yes"
                          ) {
                            deleteUpdate(update.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                      <button onClick={loadPhotos(update)}>
                        Reload photos
                      </button>
                    </div>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <th scope="row" colSpan={3} aria-busy="true">
                Loading...
              </th>
            </tr>
          )}
        </tbody>
      </table>
      <div className="grid">
        <button onClick={() => setLocation("/updates/new")}>Add</button>
        {!isAuthorized ? (
          authorize ? (
            <button type="button" onClick={authorize}>
              Authorize
            </button>
          ) : (
            "Loading..."
          )
        ) : null}
      </div>
    </>
  );
}
