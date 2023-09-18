import PhotoAlbum from "react-photo-album";

type Props = {
  items: {
    id: string;
    image_url: string;
    width: number;
    height: number;
  }[];
};

const breakpoints = [3840, 2400, 1080, 640, 384, 256, 128, 96, 64, 48];

export function Photos({ items }: Props) {
  if (Photos.length === 0) {
    return null;
  }

  const photos = items.map((photo) => ({
    src: `${photo.image_url}=h200`,
    width: photo.width,
    height: photo.height,
  }));

  return <PhotoAlbum targetRowHeight={200} layout="rows" photos={photos} />;
}
