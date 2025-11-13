export default function SkeletonCard() {
  return (
    <div className="animate-pulse flex gap-4 rounded-lg m-2 w-96 bg-zinc-900">
      <div className="bg-zinc-800 size-24 rounded-l-lg" />
      <div className="p-3 flex-1">
        <div className="h-6 bg-zinc-800 rounded w-1/2 mb-2" />
        <div className="h-4 bg-zinc-800 rounded w-full mb-1" />
        <div className="h-4 bg-zinc-800 rounded w-full mb-1" />
      </div>
    </div>
  );
}
