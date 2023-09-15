import { FormEvent, useEffect, useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import { useScript } from "usehooks-ts";
import { Collection } from "../../api/schema";
import { useAuth, useCollection, useDocWriter } from "../../hooks";

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

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export function Updates() {
  console.debug("Rendering component Admin/Updates");

  const { user } = useAuth();
  const updates = useCollection(Collection.Updates);
  const writeUpdate = useDocWriter(Collection.Updates);
  const [geo, setGeoValue] = useState<PlaceResult | null>(null);

  const status = useScript("https://apis.google.com/js/api.js");

  useEffect(() => {
    if (!user) {
      return;
    }

    if (typeof gapi !== "undefined") {
      gapi.load("client", () => {
        gapi.client
          .init({
            apiKey: GOOGLE_API_KEY,
            clientId: GOOGLE_CLIENT_ID,
            discoveryDocs: [
              "https://photoslibrary.googleapis.com/$discovery/rest?version=v1",
            ],
            scope: "https://www.googleapis.com/auth/photoslibrary.readonly",
          })
          .then(() => {
            gapi.client.setToken({
              access_token: user.token,
            });
          })
          .then(() => {
            console.log({ gapi });
            return (gapi.client as any).photoslibrary.albums.list();
          })
          .then(function (response) {
            console.log(response.result);
          });
      });
    }
  }, [status]);

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
          <label htmlFor="photos.album">Album:</label>
          <input id="photos.album" name="photos.album" required type="text" />
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
