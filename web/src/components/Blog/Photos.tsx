import { useState } from "react";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

type Props = {
  items: {
    id: string;
    image_url: string;
    width: number;
    height: number;
  }[];
};

const breakpoints = [3840, 2400, 1080, 640, 384, 256];

export function Photos({ items }: Props) {
  const [index, setIndex] = useState(-1);

  if (Photos.length === 0) {
    return null;
  }

  const photos = items.map((photo) => {
    const width = breakpoints[0];
    const height = (photo.height / photo.width) * width;

    return {
      src: `${photo.image_url}=w${width}`,
      width,
      height,
      srcSet: breakpoints.map((breakpoint) => {
        const height = Math.round((photo.height / photo.width) * breakpoint);
        return {
          src: `${photo.image_url}=w${breakpoint}`,
          width: breakpoint,
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
