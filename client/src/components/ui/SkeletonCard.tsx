export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-5 bg-gray-200 rounded w-8" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-36 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
      <div className="flex gap-1">
        <div className="h-5 bg-gray-200 rounded w-14" />
        <div className="h-5 bg-gray-200 rounded w-18" />
      </div>
    </div>
  );
}
