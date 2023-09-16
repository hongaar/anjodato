import { FormEvent, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { GOOGLE_API_KEY, getAllAlbums } from "../../api";
import { Collection } from "../../api/schema";
import { useAuth, useCollection, useDocWriter, useGapi } from "../../hooks";

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
  const { isAuthorized, authorize, client } = useGapi();
  const updates = useCollection(Collection.Updates);
  const writeUpdate = useDocWriter(Collection.Updates);
  const [geo, setGeoValue] = useState<PlaceResult | null>(null);
  const [albums, setAlbums] = useState([] as [string, string][]);

  async function getAlbums() {
    if (!client) {
      return;
    }

    setAlbums([["", "Loading..."]]);
    const albums = await getAllAlbums(client);
    setAlbums(albums?.map((album) => [album.id!, album.title!]) || []);
  }

  function addUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as any);

    console.log("Form values:", [...data.entries()]);

    writeUpdate(data.get("geo.name") as string, {
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
        album: data.get("photos.album") as string,
      },
    });
  }

  if (!user) {
    return null;
  }

  function setGeo(value: PlaceResult) {
    console.log(value);
    document
      .querySelector("#geo\\.name")
      ?.setAttribute("value", value.value.structured_formatting.main_text);
    document
      .querySelector("#geo\\.country")
      ?.setAttribute(
        "value",
        value.value.terms[value.value.terms.length - 1].value,
      );
    document
      .querySelector("#geo\\.place_id")
      ?.setAttribute("value", value.value.place_id);
    setGeoValue(value);
  }

  return (
    <div>
      <h2>Updates</h2>
      <form onSubmit={addUpdate}>
        <fieldset>
          <legend>Location:</legend>
          <GooglePlacesAutocomplete
            selectProps={{
              value: geo as any,
              onChange: setGeo as any,
            }}
            apiKey={GOOGLE_API_KEY}
            // autocompletionRequest={{ types: ["locality"] }}
          />
          <label htmlFor="geo.name">Name:</label>
          <input id="geo.name" name="geo.name" required type="text" />
          <label htmlFor="geo.country">Country:</label>
          <input id="geo.country" name="geo.country" required type="text" />
          <label htmlFor="geo.place_id">Place ID:</label>
          <input id="geo.place_id" name="geo.place_id" required type="text" />
        </fieldset>
        <fieldset>
          <legend>Description:</legend>
          <label htmlFor="titleDescriptiond">Title:</label>
          <input
            id="description.title"
            name="description.title"
            required
            type="text"
          />
          <label htmlFor="description.body">Body:</label>
          <textarea id="description.body" name="description.body" required />
        </fieldset>
        <fieldset>
          <legend>Photos:</legend>
          {isAuthorized ? (
            <button type="button" onClick={getAlbums}>
              getAlbums
            </button>
          ) : authorize ? (
            <button type="button" onClick={authorize}>
              Authorize
            </button>
          ) : (
            "Loading..."
          )}

          <label htmlFor="photos.album">Album:</label>
          <select id="photos.album" name="photos.album" required>
            {albums.map((album) => (
              <option key={album[0]} value={album[0]}>
                {album[1]}
              </option>
            ))}
          </select>
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
