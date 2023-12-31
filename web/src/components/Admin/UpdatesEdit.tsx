import { FormEvent, MouseEvent, useEffect, useState } from "react";
import GooglePlacesAutocomplete, {
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";
import { useSessionStorage } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "wouter";
import { GOOGLE_API_KEY, formatIso, getAllAlbums } from "../../api";
import { Collection } from "../../api/schema";
import {
  useAuth,
  useCollectionOnce,
  useDocWriter,
  useDocument,
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

export function UpdatesEdit({ params }: { params: { id: string } }) {
  console.debug("Rendering component Admin/UpdatesEdit");

  const id = params.id === "new" || !params.id ? null : (params.id as string);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { isAuthorized, authorize, unauthorize, client } = useGapi();
  const doc = useDocument(Collection.Updates, id || "x");
  const [labels] = useCollectionOnce(Collection.Labels);
  const writeUpdate = useDocWriter(Collection.Updates);
  const [geo, setGeoValue] = useState<PlaceResult | null>(null);
  const [albums, setAlbums] = useSessionStorage(
    "albums",
    [] as gapi.client.photoslibrary.Album[],
  );

  if (id && !doc) {
    document.querySelector("form")?.setAttribute("aria-busy", "true");
  }

  useEffect(() => {
    function setInputValue(name: string, value: any) {
      document
        .querySelector(`input[name=${name.replace(/\./g, "\\.")}]`)
        ?.setAttribute("value", value);
    }

    function setValue(name: string, value: any) {
      const el = document.querySelector(`[name=${name.replace(/\./g, "\\.")}]`);

      if (el && "value" in el) {
        el.value = value;
      }
    }

    if (doc) {
      setValue("label", doc.label ? doc.label.id : "");
      setInputValue("date.start", formatIso(doc.date.start));
      setInputValue("date.end", doc.date.end ? formatIso(doc.date.end) : null);
      setInputValue("geo.name", doc.location.name);
      setInputValue("geo.country", doc.location.country);
      setInputValue("geo.place_id", doc.location.place_id);
      setInputValue("geo.position.lat", doc.location.position?.lat);
      setInputValue("geo.position.lng", doc.location.position?.lng);
      setInputValue("description.title", doc.description.title);
      setValue("description.body", doc.description.body);
      setValue("photos.album", doc.photos.album?.id);

      document.querySelector("form")?.setAttribute("aria-busy", "false");
    }
  }, [doc]);

  async function getAlbums(e: MouseEvent<HTMLButtonElement>) {
    if (!client) {
      return;
    }

    const target = e.currentTarget;

    target.setAttribute("aria-busy", "true");
    setAlbums([]);

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
        unauthorize();
      } else {
        target.setAttribute("aria-busy", "false");

        throw error;
      }
    }

    target.setAttribute("aria-busy", "false");
  }

  function addUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.target as any);
    const albumId = data.get("photos.album") as string;

    writeUpdate(id || uuidv4(), {
      label: data.get("label")
        ? labels?.find((label) => label.id === data.get("label"))?._ref
        : null,
      date: {
        start: new Date(data.get("date.start") as string),
        end: data.get("date.end")
          ? new Date(data.get("date.end") as string)
          : null,
      },
      location: {
        name: data.get("geo.name") as string,
        country: data.get("geo.country") as string,
        place_id: data.get("geo.place_id") as string,
        position: {
          lat: Number(data.get("geo.position.lat") as string),
          lng: Number(data.get("geo.position.lng") as string),
        },
      },
      description: {
        title: data.get("description.title") as string,
        body: data.get("description.body") as string,
      },
      photos: {
        album:
          doc && albums.length === 0
            ? doc.photos.album // If we don't have albums yet, keep the current album
            : albumId
            ? {
                id: albumId,
                url: albums.find((album) => album.id === albumId)?.productUrl!,
                name: albums.find((album) => album.id === albumId)?.title!,
              }
            : null,
        items:
          doc && albums.length === 0
            ? doc.photos.items // If we don't have albums yet, keep the current items
            : doc && doc.photos.album?.id === albumId
            ? doc.photos.items // If the album is the same, keep the current items
            : [],
      },
    });

    setLocation("/updates");
  }

  if (!user) {
    return null;
  }

  function setGeo(value: PlaceResult) {
    geocodeByPlaceId(value.value.place_id)
      .then((results) => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        console.log({ lat, lng });

        document
          .querySelector("input[name=geo\\.position\\.lat]")
          ?.setAttribute("value", String(lat));
        document
          .querySelector("input[name=geo\\.position\\.lng]")
          ?.setAttribute("value", String(lng));
      });

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

  return (
    <>
      <h3>{id ? "Edit update" : "Add update"}</h3>
      <form onSubmit={addUpdate}>
        <label>
          Label:
          <select name="label">
            {labels ? (
              <>
                <option value="">No label</option>
                {labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.name}
                  </option>
                ))}
              </>
            ) : (
              <option>Loading labels...</option>
            )}
          </select>{" "}
        </label>
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
              apiOptions={{ language: "nl" }}
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
          </div>
          <div className="grid">
            <label>
              Place ID:
              <input name="geo.place_id" required type="text" />
            </label>
            <label>
              Lat:
              <input name="geo.position.lat" required type="text" />
            </label>
            <label>
              Lng:
              <input name="geo.position.lng" required type="text" />
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
            <textarea rows={10} name="description.body" required />
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
          </div>
        </fieldset>
        <div className="grid">
          <button type="submit">{id ? "Edit update" : "Add update"}</button>
          <button onClick={() => setLocation("/updates")}>Cancel</button>
          {isAuthorized ? (
            <button type="button" onClick={getAlbums}>
              {albums.length > 0 ? "Refresh" : "Retrieve"} list of albums
            </button>
          ) : authorize ? (
            <button type="button" onClick={authorize}>
              Authorize
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}
