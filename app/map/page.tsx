'use client';

import dynamic from 'next/dynamic';

const MapView = dynamic(
  () => import('@/components/ui/MapView'),
  { ssr: false, loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse" /> }
);

export default function MapPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">แผนที่สถานีวัดระดับน้ำ</h1>
      <MapView />
    </div>
  );
}
