'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAreas } from '@/hooks/useAreas';
import { AreaCard } from '@/components/home/AreaCard';
import { Search, MapPin } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/SkeletonCard';

export default function Home() {
  const tHome = useTranslations('home');
  const tArea = useTranslations('area');
  
  const [province, setProvince] = useState<'BKK' | 'PTT'>('BKK');
  const [search, setSearch] = useState('');
  
  const { data: areas, isLoading, isError } = useAreas(province);
  
  const [savedAreaIds, setSavedAreaIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadSaved = () => {
      const saved = JSON.parse(localStorage.getItem('saved_areas') || '[]');
      setSavedAreaIds(saved.map((a: any) => a.id));
    };
    loadSaved();
    window.addEventListener('saved_areas_changed', loadSaved);
    return () => window.removeEventListener('saved_areas_changed', loadSaved);
  }, []);

  const filteredAreas = (areas || []).filter(a => 
    a.name_th.toLowerCase().includes(search.toLowerCase()) ||
    (a.name_en && a.name_en.toLowerCase().includes(search.toLowerCase()))
  );

  const pinnedAreas = (areas || []).filter(a => savedAreaIds.includes(a.id));
  const unpinnedAreas = filteredAreas.filter(a => !savedAreaIds.includes(a.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-primary">{tHome('title')}</h1>
        <p className="text-muted">{tHome('subtitle')}</p>
      </div>

      <div className="flex bg-surface p-1 rounded-lg">
        <button 
          onClick={() => setProvince('BKK')}
          className={`flex-1 py-2 text-center rounded-md font-medium transition-colors ${province === 'BKK' ? 'bg-primary text-white shadow-sm' : 'text-text hover:bg-white/50'}`}
        >
          {tHome('switchProvince.bkk')}
        </button>
        <button 
          onClick={() => setProvince('PTT')}
          className={`flex-1 py-2 text-center rounded-md font-medium transition-colors ${province === 'PTT' ? 'bg-primary text-white shadow-sm' : 'text-text hover:bg-white/50'}`}
        >
          {tHome('switchProvince.ptt')}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
        <input 
          type="search"
          placeholder={tHome('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {isError && (
        <div className="text-status-critical text-center p-4 border rounded-lg bg-red-50">
          ไม่สามารถโหลดข้อมูลได้
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-8">
          {isMounted && pinnedAreas.length > 0 && !search && (
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-semibold text-muted flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {tArea('pinned')}
              </h2>
              <div className="flex flex-col gap-4">
                {pinnedAreas.map(area => (
                  <AreaCard 
                    key={area.id} 
                    id={area.id} 
                    name={area.name_th} 
                    status={area.status} 
                    lastUpdated={area.lastUpdated}
                    stationCount={area.stationCount}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {isMounted && pinnedAreas.length > 0 && !search && (
              <h2 className="text-sm font-semibold text-muted">พื้นที่ทั้งหมด</h2>
            )}
            {unpinnedAreas.map(area => (
              <AreaCard 
                key={area.id} 
                id={area.id} 
                name={area.name_th} 
                status={area.status} 
                lastUpdated={area.lastUpdated}
                stationCount={area.stationCount}
              />
            ))}
            {filteredAreas.length === 0 && search && (
              <p className="text-center text-muted py-8">{tHome('noData')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
