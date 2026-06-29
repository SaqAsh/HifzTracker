/** Loading fallback for the data-backed teacher routes. */
export default function Loading(): React.JSX.Element {
  return (
    <div className="grid flex-1 place-items-center py-16 text-center">
      <p className="animate-pulse text-sm font-bold uppercase tracking-[0.22em] text-sand">
        Loading…
      </p>
    </div>
  );
}
