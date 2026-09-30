/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAllStations, MapStation } from '@/hooks/useAllStations';
import { Link } from '@/i18n/routing';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Fix for default marker icons if they ever get used accidentally
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createStatusIcon(status: string) {
  let colorClass = 'bg-status-nodata';
  if (status === 'normal') colorClass = 'bg-status-normal';
  if (status === 'watch') colorClass = 'bg-status-watch';
  if (status === 'critical') colorClass = 'bg-status-critical';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-4 h-4 rounded-full border-2 border-white shadow-md ${colorClass}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function MapBounds({ stations }: { stations: MapStation[] }) {
  const map = useMap();
  useEffect(() => {
    if (stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stations, map]);
  return null;
}

export default function MapClient() {
  const { data: stations, isLoading } = useAllStations();

  // Initial bounds centered between BKK and PTT
  const defaultCenter: [number, number] = [13.88, 100.51];
  const defaultZoom = 10;

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-surface rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-muted">กำลังโหลดแผนที่...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border shadow-sm relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stations && <MapBounds stations={stations} />}

        {stations?.map(station => (
          <Marker 
            key={station.id} 
            position={[station.lat, station.lng]} 
            icon={createStatusIcon(station.status)}
          >
            <Popup className="custom-popup">
              <div className="flex flex-col gap-2 min-w-[200px]">
                <div>
                  <h3 className="font-bold text-text text-sm">{station.name}</h3>
                  <p className="text-xs text-muted">{station.area_name}</p>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted">ระดับน้ำปัจจุบัน</span>
                    <span className="font-bold text-lg text-primary-dark">
                      {station.latest_reading?.level !== null && station.latest_reading?.level !== undefined 
                        ? station.latest_reading.level.toFixed(2) 
                        : '-'}
                    </span>
                  </div>
                  <StatusBadge status={station.status} />
                </div>

                <Link 
                  href={`/stations/${encodeURIComponent(station.id)}`}
                  className="mt-2 w-full bg-primary text-white text-center text-xs py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
