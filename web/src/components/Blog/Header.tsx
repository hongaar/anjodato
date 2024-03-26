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
  permalink?: boolean;
};

export function Header({
  id,
  title,
  locationName,
  locationCountry,
  placeId,
  dateStart,
  dateEnd,
  permalink = true,
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
          &nbsp; <br className="mobile-only" />
          📅{" "}
          {dateEnd
            ? daterangeFormat(dateStart, dateEnd)
            : dateFormat(dateStart)}
        </p>
      </hgroup>
      {permalink ? (
        <a
          className="permalink"
          href={`/bericht/${id}`}
          rel="noreferrer"
          target="_blank"
        >
          ❐ Permalink
        </a>
      ) : null}
    </header>
  );
}
