export function SkeletonCard() {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col gap-3 shadow-sm animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-10 w-24 bg-gray-200 rounded"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
  );
}
