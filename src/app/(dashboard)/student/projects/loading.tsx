export default function StudentProjectsLoading() {
  return (
    <div className="space-y-6 pb-12">
      <div className="h-40 animate-pulse rounded-3xl bg-slate-100" />
      <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
        <div className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="h-72 animate-pulse rounded-2xl bg-slate-100" key={`card-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
