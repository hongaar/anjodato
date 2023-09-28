import { AddId, AddIdAndRef, Like, Update as UpdateDoc } from "../../api";
import { Body } from "./Body";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Photos } from "./Photos";

type Props = {
  update: AddId<UpdateDoc>;
  likes: AddIdAndRef<Like>[] | null;
  permalink?: boolean;
};

export function Update({ update, likes, permalink = true }: Props) {
  return (
    <article key={update.id}>
      <Header
        id={update.id}
        title={update.description.title}
        locationName={update.location.name}
        locationCountry={update.location.country}
        placeId={update.location.place_id}
        lat={update.location.position?.lat}
        lng={update.location.position?.lng}
        dateStart={update.date.start}
        dateEnd={update.date.end}
        permalink={permalink}
      />
      <Body text={update.description.body} />
      <Photos
        items={update.photos.items}
        location={update.location}
        likes={likes}
      />
      <Footer updateId={update.id} />
    </article>
  );
}
