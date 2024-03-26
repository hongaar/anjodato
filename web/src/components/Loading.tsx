export function Loading() {
  console.debug("Rendering component Loading");

  return (
    <article className="text-center">
      <span aria-busy="true">Aan het opstarten</span>
    </article>
  );
}
