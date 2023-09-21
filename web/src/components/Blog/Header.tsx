import { dateFormat, daterangeFormat } from "../../api";

type Props = {
  title?: string | null;
  locationName: string;
  locationCountry: string;
  placeId: string;
  dateStart: Date;
  dateEnd?: Date | null;
};

export function Header({
  title,
  locationName,
  locationCountry,
  placeId,
  dateStart,
  dateEnd,
}: Props) {
  return (
    <header>
      <hgroup>
        <h2>{title ? title : locationName}</h2>
        <p>
          📍{" "}
          <a
            href={`https://www.google.com/maps/place/?q=place_id:${placeId}`}
            rel="noreferrer"
            target="_blank"
          >
            {title ? `${locationName}, ${locationCountry}` : locationCountry}
          </a>{" "}
          &nbsp; 📅{" "}
          {dateEnd
            ? daterangeFormat(dateStart, dateEnd)
            : dateFormat(dateStart)}
        </p>
      </hgroup>
    </header>
  );
}
