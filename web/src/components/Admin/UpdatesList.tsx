import { MouseEvent } from "react";
import { useLocation } from "wouter";
import { formatIso, getAllPhotos, progress } from "../../api";
import { Collection, DocWithId, Functions } from "../../api/schema";
import {
  useAuth,
  useCollection,
  useDocDeleter,
  useDocWriter,
  useGapi,
} from "../../hooks";
import { useFunction } from "../../hooks/useFunction";

export function UpdatesList() {
  console.debug("Rendering component Admin/UpdatesList");

  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { isAuthorized, authorize, unauthorize, client } = useGapi();
  const updates = useCollection(Collection.Updates);
  const writeUpdate = useDocWriter(Collection.Updates);
  const deleteUpdate = useDocDeleter(Collection.Updates);
  const cleanPhotos = useFunction(Functions.CleanPhotos);
  const downloadPhoto = useFunction(Functions.DownloadPhoto);

  if (!user) {
    return null;
  }

  async function removePhotosForUpdate(id: string) {
    await progress(
      cleanPhotos({ updateId: id }),
      "Cleaning existing photos...",
    );
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
        const photos = await progress(
          getAllPhotos(client, update.photos.album.id),
          "Get album details from Google Photos...",
        );

        if (photos) {
          await removePhotosForUpdate(update.id);

          const photoList = [];

          // Iterate Google Photos album, upload each photo to Firebase Storage
          for (const photo of photos) {
            const url = `${photo.baseUrl!}=w3840`;
            const path = `images/${update.id}/${photo.filename}`;
            const result = await progress(
              downloadPhoto({ url, path }),
              `Download photo ${photo.filename}...`,
            );

            if (result?.data.publicUrl) {
              photoList.push({
                path,
                url: result.data.publicUrl,
                source_id: photo.id || "",
                source_url: photo.productUrl || "",
                height: parseInt(photo.mediaMetadata?.height as string, 10),
                width: parseInt(photo.mediaMetadata?.width as string, 10),
                created_on: (photo.mediaMetadata?.creationTime as string) || "",
              });
            } else {
              throw new Error("Failed to upload photo");
            }
          }

          await progress(
            writeUpdate(update.id, {
              photos: {
                album: update.photos.album,
                items: photoList,
              },
            }),
            `Writing list of photos...`,
          );
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
            <th scope="col">Title</th>
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
                    {formatIso(update.date.start)}
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
                        onClick={async () => {
                          if (
                            prompt(
                              'If you really want to delete this blog, type "yes"',
                              "no",
                            ) === "yes"
                          ) {
                            await removePhotosForUpdate(update.id);
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
