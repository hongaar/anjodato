import { MouseEvent, useCallback, useMemo, useState } from "react";
import PhotoAlbum from "react-photo-album";
import { useDarkMode } from "usehooks-ts";
import { v4 as uuidv4 } from "uuid";
import Lightbox, {
  PluginProps,
  addToolbarButton,
  useLightboxProps,
  useLightboxState,
} from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";
import {
  AddIdAndRef,
  Collection,
  GOOGLE_API_KEY,
  Like,
  Update,
} from "../../api";
import { useDocWriter } from "../../hooks";

declare module "yet-another-react-lightbox" {
  interface LightboxProps {
    likes?: AddIdAndRef<Like>[] | null;
  }
}

type Props = {
  items: {
    url: string;
    width: number;
    height: number;
  }[];
  location?: Update["location"];
  likes: AddIdAndRef<Like>[] | null;
};

const sizes = [3840, 2400, 1080, 640, 384, 256];

const EXTENSION = "jpeg";

function getDimension(size: number, width: number, height: number) {
  if (width > height) {
    return {
      width: size,
      height: Math.round((height / width) * size),
    };
  } else {
    return {
      width: Math.round((width / height) * size),
      height: size,
    };
  }
}

function getUrl(url: string, size: number) {
  const parsed = new URL(url);
  const pathname = parsed.pathname;

  // strip extension from pathname
  const extension = pathname.split(".").pop();
  const basename = pathname.replace(`.${extension}`, "");

  parsed.pathname = `${basename}_${size}x${size}.${EXTENSION}`;

  return parsed.toString();
}

function getMapsUrl(location: string, width = 640, scale = 2, dark = false) {
  const height = Math.round((width / 4) * 3);
  return `https://maps.googleapis.com/maps/api/staticmap?key=${GOOGLE_API_KEY}&maptype=terrain&size=${width}x${height}&scale=2&markers=color:red%7C${encodeURIComponent(
    location,
  )}&zoom=7`;
}

function renderCounter(counter?: number) {
  return counter ? "❤️".repeat(counter) : "";
}

function SlideLikeButton() {
  const { currentSlide } = useLightboxState();
  const { likes } = useLightboxProps();
  const write = useDocWriter(Collection.Likes);

  if (!currentSlide) {
    return null;
  }

  const currentLike = likes?.find(
    (like) => like.url === (currentSlide as any).key,
  );

  async function addLike(e: MouseEvent<HTMLButtonElement>) {
    const target = e.currentTarget;

    target.setAttribute("aria-busy", "true");

    await write(currentLike?.id || uuidv4(), {
      url: (currentSlide as any).key,
      counter: currentLike ? currentLike.counter + 1 : 1,
    });

    target.setAttribute("aria-busy", "false");
    target.blur();
  }

  return (
    <button
      onClick={addLike}
      type="button"
      className="yarl__button likes"
      aria-busy={likes === null ? "true" : "false"}
    >
      {likes === null ? (
        ""
      ) : (
        <>
          {currentLike?.counter ? (
            <span className="current-likes">
              {renderCounter(currentLike?.counter)}
            </span>
          ) : null}
          <span className="add-like">❤️</span> Mooi hoor
        </>
      )}
    </button>
  );
}

/** Fullscreen plugin */
export function LikePlugin({ augment }: PluginProps) {
  augment(({ toolbar, ...restProps }) => ({
    toolbar: addToolbarButton(toolbar, "like", <SlideLikeButton />),
    ...restProps,
  }));
}

export function Photos({ location, items, likes }: Props) {
  console.debug("Rendering component Blog/Photos");

  const [index, setIndex] = useState(-1);
  const { isDarkMode } = useDarkMode();
  const writeLike = useDocWriter(Collection.Likes);

  const addLike = useCallback(
    async function (
      e: MouseEvent<HTMLButtonElement>,
      key: string,
      currentLike?: AddIdAndRef<Like>,
    ) {
      const target = e.currentTarget;

      target.setAttribute("aria-busy", "true");

      await writeLike(currentLike?.id || uuidv4(), {
        url: key,
        counter: currentLike ? currentLike.counter + 1 : 1,
      });

      target.setAttribute("aria-busy", "false");
    },
    [writeLike],
  );

  const photos = useMemo(() => {
    const photos = items.map((photo) => {
      const { width, height } = getDimension(
        sizes[0],
        photo.width,
        photo.height,
      );

      return {
        key: photo.url,
        src: getUrl(photo.url, width),
        width,
        height,
        srcSet: sizes.map((size) => {
          const { width, height } = getDimension(
            size,
            photo.width,
            photo.height,
          );

          return {
            src: getUrl(photo.url, size),
            width,
            height,
          };
        }),
      };
    });

    if (location) {
      const locationName = `${location.name}, ${location.country}`;
      const locationPosition = location.position
        ? `${location.position.lat},${location.position.lng}`
        : locationName;
      photos.unshift({
        key: `googlemaps/${locationName}`,
        src: getMapsUrl(locationPosition, 640, 2, isDarkMode),
        width: 1280,
        height: 960,
        srcSet: [
          {
            src: getMapsUrl(locationPosition, 640, 2, isDarkMode),
            width: 1280,
            height: 960,
          },
          {
            src: getMapsUrl(locationPosition, 400, 1, isDarkMode),
            width: 800,
            height: 600,
          },
        ],
      });
    }

    return photos;
  }, [items, location, isDarkMode]);

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      <PhotoAlbum
        photos={photos}
        layout="rows"
        onClick={({ index }) => setIndex(index)}
        targetRowHeight={(containerWidth) => {
          if (containerWidth < 576) return Math.round(containerWidth / 3);
          if (containerWidth < 768) return Math.round(containerWidth / 3);
          if (containerWidth < 992) return Math.round(containerWidth / 4);
          if (containerWidth < 1200) return Math.round(containerWidth / 5);
          return Math.round(containerWidth / 6);
        }}
        renderPhoto={({ photo, wrapperStyle, renderDefaultPhoto }) => {
          const currentLike = likes?.find((like) => like.url === photo.key);

          return (
            <span style={wrapperStyle}>
              {renderDefaultPhoto({ wrapped: true })}
              <button
                onClick={(e) => addLike(e, photo.key, currentLike)}
                type="button"
                className="likes"
                aria-busy={likes === null ? "true" : "false"}
              >
                {likes === null ? (
                  ""
                ) : (
                  <>
                    {currentLike?.counter ? (
                      <span className="current-likes">
                        {renderCounter(currentLike?.counter)}
                      </span>
                    ) : null}
                    <span className="add-like">❤️</span>
                  </>
                )}
              </button>
            </span>
          );
        }}
      />

      <Lightbox
        slides={photos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        on={{
          view: ({ index }) => setIndex(index),
        }}
        plugins={[Zoom, LikePlugin]}
        likes={likes}
      />
    </>
  );
}
