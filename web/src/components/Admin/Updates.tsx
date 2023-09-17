import { FormEvent, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useSessionStorage } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { GOOGLE_API_KEY, getAllAlbums } from "../../api";
import { Collection } from "../../api/schema";
import {
  useAuth,
  useCollection,
  useDocDeleter,
  useDocWriter,
  useGapi,
} from "../../hooks";

type PlaceResult = {
  label: string;
  value: {
    description: string;
    place_id: string;
    reference: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
    terms: { offset: number; value: string }[];
    types: string[];
  };
};

export function Updates() {
  console.debug("Rendering component Admin/Updates");

  const { user } = useAuth();
  const { isAuthorized, authorize, unauthorize, client } = useGapi();
  const updates = useCollection(Collection.Updates);
  const writeUpdate = useDocWriter(Collection.Updates);
  const deleteUpdate = useDocDeleter(Collection.Updates);
  const [geo, setGeoValue] = useState<PlaceResult | null>(null);
  const [albums, setAlbums] = useSessionStorage(
    "albums",
    [] as gapi.client.photoslibrary.Album[],
  );

  async function getAlbums() {
    if (!client) {
      return;
    }

    setAlbums([{ title: "Loading..." }]);
    try {
      const albums = await getAllAlbums(client);
      setAlbums(albums || []);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        error.status === 401
      ) {
        setAlbums([{ title: "Please re-authorize..." }]);
        unauthorize();
      } else {
        throw error;
      }
    }
  }

  function addUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as any);

    console.log("Form values:", [...data.entries()]);

    const albumId = data.get("photos.album") as string;

    writeUpdate(uuidv4(), {
      date: {
        start: data.get("date.start") as string,
        end: data.get("date.end") as string,
      },
      location: {
        name: data.get("geo.name") as string,
        country: data.get("geo.country") as string,
        place_id: data.get("geo.place_id") as string,
      },
      description: {
        title: data.get("description.title") as string,
        body: data.get("description.body") as string,
      },
      photos: {
        album: albumId
          ? {
              id: albumId,
              url: albums.find((album) => album.id === albumId)?.productUrl!,
              name: albums.find((album) => album.id === albumId)?.title!,
              image_url: albums.find((album) => album.id === albumId)
                ?.coverPhotoBaseUrl!,
            }
          : null,
      },
    });
  }

  if (!user) {
    return null;
  }

  function setGeo(value: PlaceResult) {
    document
      .querySelector("input[name=geo\\.name]")
      ?.setAttribute("value", value.value.structured_formatting.main_text);
    document
      .querySelector("input[name=geo\\.country]")
      ?.setAttribute(
        "value",
        value.value.terms[value.value.terms.length - 1].value,
      );
    document
      .querySelector("input[name=geo\\.place_id]")
      ?.setAttribute("value", value.value.place_id);
    setGeoValue(value);
  }

  async function loadPhotos(updateId: string) {}

  return (
    <>
      <h3>Updates</h3>
      <form onSubmit={addUpdate}>
        <fieldset>
          <legend>Date</legend>
          <div className="grid">
            <label>
              Start:
              <input name="date.start" required type="date" />
            </label>
            <label>
              End:
              <input name="date.end" type="date" />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Location</legend>
          <label>
            Search:
            <GooglePlacesAutocomplete
              selectProps={{
                value: geo as any,
                onChange: setGeo as any,
              }}
              apiKey={GOOGLE_API_KEY}
              // autocompletionRequest={{ types: ["locality"] }}
            />
          </label>
          <div className="grid">
            <label>
              Name:
              <input name="geo.name" required type="text" />
            </label>
            <label>
              Country:
              <input name="geo.country" required type="text" />
            </label>
            <label>
              Place ID:
              <input name="geo.place_id" required type="text" />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Description</legend>
          <label>
            Title
            <input name="description.title" type="text" />
          </label>
          <label>
            Body
            <textarea rows={6} name="description.body" required />
          </label>
        </fieldset>
        <fieldset>
          <legend>Photos</legend>
          <div className="grid">
            <label>
              Album
              <select name="photos.album">
                {albums.length > 0 ? (
                  <>
                    <option value="">No album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </>
                ) : (
                  <option>Please retrieve albums first...</option>
                )}
              </select>
            </label>
            {isAuthorized ? (
              <button type="button" onClick={getAlbums}>
                {albums.length > 0 ? "Refresh" : "Retrieve"} list of albums
              </button>
            ) : authorize ? (
              <button type="button" onClick={authorize}>
                Authorize
              </button>
            ) : (
              "Loading..."
            )}
          </div>
        </fieldset>
        <button type="submit">Add update</button>
      </form>
      <table>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Location</th>
            <th scope="col">Title</th>
            <th scope="col">Album</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {updates
            // sort by date
            .sort((a, b) => (a.date.start > b.date.start ? 1 : -1))
            .map((update) => (
              <tr key={update.id}>
                <th scope="row">{update.date.start}</th>
                <td>
                  <a
                    href={`https://www.google.com/maps/place/?q=place_id:${update.location.place_id}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {update.location.name}
                  </a>
                </td>
                <td>{update.description.title}</td>
                <td>
                  <a
                    href={update.photos.album?.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {update.photos.album?.name}
                  </a>
                </td>
                <td>
                  <div className="grid">
                    <button onClick={() => deleteUpdate(update.id)}>
                      Delete
                    </button>
                    <button onClick={() => loadPhotos(update.id)}>
                      Reload photos
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
