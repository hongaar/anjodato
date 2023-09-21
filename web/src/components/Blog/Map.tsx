type Props = {
  location: string;
  placeId: string;
};

export function Map({ location, placeId }: Props) {
  return (
    <img src="https://maps.googleapis.com/maps/api/staticmap" alt={location} />
  );
}
