import { Link } from "wouter";
import { AddIdAndRef, Label } from "../../api";

type Props = {
  labels: AddIdAndRef<Label>[] | null;
  activeName?: string;
};

export function Labels({ labels, activeName }: Props) {
  console.debug("Rendering component Blog/Labels");

  if (labels === null) {
    return null;
  }

  return (
    <nav>
      {labels.map((label) => (
        <Link
          href={activeName === label.name ? "/" : `/${label.name}`}
          className="label"
          aria-current={activeName === label.name ? "page" : undefined}
          key={label.id}
        >
          <span className="emoji">{label.emoji}</span>
          {label.name}
        </Link>
      ))}
    </nav>
  );
}
