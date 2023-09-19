import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Props = {
  items: {
    url: string;
    width: number;
    height: number;
  }[];
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

export function Photos({ items }: Props) {
  const [index, setIndex] = useState(-1);

  if (Photos.length === 0) {
    return null;
  }

  const photos = items.map((photo) => {
    const { width, height } = getDimension(sizes[0], photo.width, photo.height);

    return {
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

  return (
    <>
      <PhotoAlbum
        photos={photos}
        layout="rows"
        targetRowHeight={200}
        onClick={({ index }) => setIndex(index)}
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
