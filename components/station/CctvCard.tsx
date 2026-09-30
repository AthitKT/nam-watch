'use client';

import { useState, useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function CctvCard({ url, stationName }: { url: string; stationName: string }) {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Avoid SSR hydration mismatch and setup 5-minute interval
  useEffect(() => {
    setTimestamp(Date.now());

    const intervalId = setInterval(() => {
      setIsRefreshing(true);
      setHasError(false);
      setTimestamp(Date.now());
    }, 300000); // 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  if (!url || url.trim() === '') return null;

  const handleReload = () => {
    setIsRefreshing(true);
    setHasError(false);
    setTimestamp(Date.now());
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm flex flex-col">
      <div className="p-3 border-b flex justify-between items-center bg-surface">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-text">ภาพจากกล้อง CCTV ตรวจวัดล่าสุด</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 bg-status-normal rounded-full animate-pulse"></div>
            <span className="text-status-normal font-medium">LIVE (อัปเดตอัตโนมัติทุก 5 นาที)</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          {timestamp && <span>ล่าสุด {format(timestamp, 'HH:mm', { locale: th })} น.</span>}
          <button 
            onClick={handleReload}
            className="p-1.5 text-muted hover:text-primary transition-colors rounded-md hover:bg-white border"
            title="โหลดภาพใหม่"
          >
            <RefreshCw className={`w-4 h-4 ${(isInitialLoading || isRefreshing) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
        {hasError ? (
          <div className="flex flex-col items-center gap-2 text-muted p-4 text-center z-20">
            <Camera className="w-8 h-8 opacity-50" />
            <p className="text-sm">ไม่สามารถเชื่อมต่อสัญญาณกล้องได้ในขณะนี้</p>
          </div>
        ) : (
          <>
            {isInitialLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {timestamp !== null && (
              <img 
                src={`/api/cctv-proxy?url=${encodeURIComponent(url)}&t=${timestamp}`} 
                alt={`CCTV - ${stationName}`}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isInitialLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => {
                  setIsInitialLoading(false);
                  setIsRefreshing(false);
                }}
                onError={() => {
                  setIsInitialLoading(false);
                  setIsRefreshing(false);
                  setHasError(true);
                }}
                referrerPolicy="no-referrer"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
