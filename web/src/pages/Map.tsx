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
  updates: AddIdAndRef<UpdateDoc>[],
  setActiveUpdate: Dispatch<
    React.SetStateAction<AddIdAndRef<UpdateDoc> | null>
  >,
) {
  const { Map } = await loader.importLibrary("maps");
  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  const map = new Map(document.getElementById("map") as HTMLElement, {
    zoom: 3,
    center: { lat: 0, lng: 73 },
    mapId: "27782f5b0452dce6",

    // gestureHandling: "greedy",

    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
  });

  const pins: HTMLDivElement[] = [];
  updates.forEach((update, i) => {
    if (update.location.position) {
      const pin = document.createElement("div");
      pin.className = "update-location";
      pin.textContent = `${i + 1}`;
      pins.push(pin);

      const marker = new AdvancedMarkerElement({
        position: update.location.position,
        map,
        title: `${i + 1}. ${
          update.description.title
            ? update.description.title
            : `${update.location.name}, ${update.location.country}`
        }`,
        content: pin,
      });

      // Add a click listener for each marker, and set up the info window.
      marker.addListener("click", ({ domEvent, latLng }: any) => {
        pins.forEach((pin) => {
          pin.classList.remove("active");
        });

        setActiveUpdate((previousUpdate) => {
          if (previousUpdate === update) {
            return null;
          }

          pin.classList.add("active");

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
    }
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

  useEffect(() => {
    console.log("Rendering map");
    if (updates !== null && updates.length > 0) {
      initMap(updates, setActiveUpdate);
    }
  }, [updates]);

  return (
    <>
      <Helmet>
        <title>Kaart</title>
      </Helmet>
      <header className="sticky">
        <hgroup>
          <Link href="/">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a>
              <h1>AnJoDaTo</h1>
            </a>
          </Link>
        </hgroup>
      </header>
      <main className="container-fluid map">
        <div className="grid">
          {updates === null ? (
            <article>
              <p aria-busy="true">Berichten laden...</p>
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
