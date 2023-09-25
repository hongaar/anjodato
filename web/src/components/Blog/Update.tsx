import { AddIdAndRef, Like, Update as UpdateDoc } from "../../api";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Photos } from "./Photos";

type Props = {
  update: AddIdAndRef<UpdateDoc>;
  likes: AddIdAndRef<Like>[] | null;
};

export function Update({ update, likes }: Props) {
  return (
    <article key={update.id}>
      <Header
        title={update.description.title}
        locationName={update.location.name}
        locationCountry={update.location.country}
        placeId={update.location.place_id}
        dateStart={update.date.start}
        dateEnd={update.date.end}
      />
      <Body text={update.description.body} />
      <Photos
        items={update.photos.items}
        map={`${update.location.name}, ${update.location.country}`}
        likes={likes}
      />
      <Footer updateId={update.id} />
    </article>
  );
}
