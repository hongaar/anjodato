import { format } from "date-fns";
import { nl } from "date-fns/locale";

type Props = {
  title?: string | null;
  location: string;
  dateStart: string;
  dateEnd?: string | null;
};

export function Header({ title, location, dateStart, dateEnd }: Props) {
  return (
    <header>
      <hgroup>
        <h3>{title ? title : location}</h3>
        <p>
          {format(new Date(dateStart), "d LLLL y", {
            locale: nl,
          })}
          {title ? ` — ${location}}` : null}
        </p>
      </hgroup>
    </header>
  );
}
