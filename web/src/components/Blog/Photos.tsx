import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import { useDarkMode } from "usehooks-ts";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { GOOGLE_API_KEY } from "../../api";

type Props = {
  items: {
    url: string;
    width: number;
    height: number;
  }[];
  map?: string;
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

export function Photos({ map, items }: Props) {
  const [index, setIndex] = useState(-1);
  const { isDarkMode } = useDarkMode();

  if (Photos.length === 0) {
    return null;
  }

  const photos = items.map((photo) => {
    const { width, height } = getDimension(sizes[0], photo.width, photo.height);

    return {
      key: photo.url,
      src: getUrl(photo.url, width),
      width,
      height,
      srcSet: sizes.map((size) => {
        const { width, height } = getDimension(size, photo.width, photo.height);

        return {
          src: getUrl(photo.url, size),
          width,
          height,
        };
      }),
    };
  });

  if (map) {
    photos.unshift({
      key: "googlemaps",
      src: getMapsUrl(map, 640, 2, isDarkMode),
      width: 1280,
      height: 960,
      srcSet: [
        {
          src: getMapsUrl(map, 640, 2, isDarkMode),
          width: 1280,
          height: 960,
        },
        {
          src: getMapsUrl(map, 400, 1, isDarkMode),
          width: 800,
          height: 600,
        },
      ],
    });
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
      />

      <Lightbox
        slides={photos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
      />
    </>
  );
}
