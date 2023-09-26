import { Loader } from "@googlemaps/js-api-loader";
import { orderBy } from "firebase/firestore";
import { Dispatch, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import {
  AddIdAndRef,
  Collection,
  GOOGLE_API_KEY,
  Update as UpdateDoc,
} from "../api";
import { Update } from "../components/Blog";
import { useCollection, useQueryOnce } from "../hooks";

const loader = new Loader({
  apiKey: GOOGLE_API_KEY!,
});

async function initMap(
  maps: google.maps.MapsLibrary,
  marker: google.maps.MarkerLibrary,
  updates: AddIdAndRef<UpdateDoc>[],
  setActiveUpdate: Dispatch<
    React.SetStateAction<AddIdAndRef<UpdateDoc> | null>
  >,
) {
  const { Map } = maps;
  const { AdvancedMarkerElement } = marker;

  const map = new Map(document.getElementById("map") as HTMLElement, {
    zoom: 3,
    center: { lat: 0, lng: 73 },
    mapId: "27782f5b0452dce6",

    // gestureHandling: "greedy",

    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
  });

  const pins: HTMLDivElement[] = [];

  const markers = updates.reduce(
    (markers, update, index) => {
      if (update.location.position) {
        const positionStr = `${update.location.position.lat},${update.location.position.lng}`;

        if (positionStr in markers) {
          markers[positionStr].updates.push({ index, update });
        } else {
          markers[positionStr] = {
            position: update.location.position,
            updates: [{ index, update }],
          };
        }
      }

      return markers;
    },
    {} as Record<
      string,
      {
        position: { lat: number; lng: number };
        updates: { index: number; update: AddIdAndRef<UpdateDoc> }[];
      }
    >,
  );

  Object.values(markers).forEach(({ position, updates: markerUpdates }) => {
    const pinWrapper = document.createElement("div");
    pinWrapper.className = "update-location-wrapper";

    markerUpdates.forEach(({ index, update }) => {
      const pin = document.createElement("div");
      pin.className = "update-location";
      pin.textContent = `${index + 1}`;
      pin.setAttribute(
        "data-tooltip",
        update.description.title
          ? update.description.title
          : `${update.location.name}, ${update.location.country}`,
      );
      pin.setAttribute("data-update-id", update.id);
      pins.push(pin);
      pinWrapper.appendChild(pin);
    });

    const markerElement = new AdvancedMarkerElement({
      zIndex: 2,
      position,
      map,
      content: pinWrapper,
    });

    // Add a click listener for each marker, and set up the info window.
    markerElement.addListener("click", ({ domEvent, latLng }: any) => {
      pins.forEach((pin) => {
        pin.classList.remove("active");
      });
      const target = domEvent.target as HTMLDivElement;
      const updateId = target.getAttribute("data-update-id");

      const update = updates.find((update) => update.id === updateId);

      if (!update) {
        console.warn("Could not find update for pin", target);
        return;
      }

      setActiveUpdate((previousUpdate) => {
        if (previousUpdate === update) {
          return null;
        }

        target.classList.add("active");

        if (document.documentElement.clientWidth > 992) {
          setTimeout(
            () =>
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth",
              }),
            100,
          );
        } else {
          setTimeout(
            () =>
              window.scrollTo({
                top: 200,
                left: 0,
                behavior: "smooth",
              }),
            100,
          );
        }

        return update;
      });
    });
  });
}

export function Map() {
  console.debug("Rendering page Map");

  const [updates] = useQueryOnce(
    [Collection.Updates],
    orderBy("date.start", "asc"),
  );
  const likes = useCollection(Collection.Likes);
  const [activeUpdate, setActiveUpdate] =
    useState<AddIdAndRef<UpdateDoc> | null>(null);
  const [maps, setMaps] = useState<google.maps.MapsLibrary | null>(null);
  const [marker, setMarker] = useState<google.maps.MarkerLibrary | null>(null);

  useEffect(() => {
    console.log("Loading maps library");
    loader.importLibrary("maps").then(setMaps);
    loader.importLibrary("marker").then(setMarker);
  }, []);

  useEffect(() => {
    if (maps && marker && updates !== null && updates.length > 0) {
      initMap(maps, marker, updates, setActiveUpdate);
    }
  }, [maps, marker, updates]);

  return (
    <>
      <Helmet>
        <title>Kaart</title>
      </Helmet>

      <nav className="sticky">
        <Link role="button" href="/">
          ✍️ Blog
        </Link>
      </nav>
      <main className="container-fluid map">
        <div className="grid">
          {updates === null ? (
            <article>
              <p aria-busy="true">Kaart laden...</p>
            </article>
          ) : updates.length > 0 ? (
            <div id="map" />
          ) : (
            <article>
              <p>Geen berichten</p>
            </article>
          )}
          {activeUpdate ? <Update update={activeUpdate} likes={likes} /> : null}
        </div>
      </main>
    </>
  );
}
