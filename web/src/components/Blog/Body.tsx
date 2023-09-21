import nl2br from "react-nl2br";

type Props = {
  text?: string | null;
};

function interleave(arr: any[], thing: any) {
  // @ts-ignore
  return [].concat(...arr.map((n) => [n, thing])).slice(0, -1);
}

function formatText(text: string) {
  let sections = text.split(/---/g);

  sections = sections.map((section) => section.trim());
  sections = interleave(sections, <hr />);

  return sections.map(nl2br) as any[];
}

export function Body({ text }: Props) {
  return text ? <section>{formatText(text)}</section> : null;
}
