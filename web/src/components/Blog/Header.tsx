import { Link } from "wouter";
import { dateFormat, daterangeFormat } from "../../api";

type Props = {
  id: string;
  title?: string | null;
  locationName: string;
  locationCountry: string;
  placeId: string;
  lat?: number;
  lng?: number;
  dateStart: Date;
  dateEnd?: Date | null;
};

export function Header({
  id,
  title,
  locationName,
  locationCountry,
  placeId,
  lat,
  lng,
  dateStart,
  dateEnd,
}: Props) {
  console.debug("Rendering component Blog/Header");

  return (
    <header>
      <hgroup>
        <h2>{title ? title : locationName}</h2>
        <p>
          📍{" "}
          <a
            /* `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},9z` */
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
      <Link className="permalink" href={`/bericht/${id}`}>
        🔗 Link naar dit bericht
      </Link>
    </header>
  );
}
