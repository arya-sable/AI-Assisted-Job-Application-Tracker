export default function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-200/60 bg-white p-3.5 dark:border-slate-700/40 dark:bg-slate-800/60">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 w-24 rounded-md animate-shimmer" />
        <div className="h-5 w-8 rounded-md animate-shimmer" />
      </div>
      <div className="h-4 w-36 rounded-md mb-2 animate-shimmer" />
      <div className="h-3 w-28 rounded-md mb-3 animate-shimmer" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-md animate-shimmer" />
        <div className="h-5 w-16 rounded-md animate-shimmer" />
      </div>
    </div>
  );
}
