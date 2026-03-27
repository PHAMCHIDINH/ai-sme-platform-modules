export default function StudentLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-3xl bg-slate-100" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" key={`metric-${index}`} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" key={`panel-${index}`} />
        ))}
      </div>
    </div>
  );
}
