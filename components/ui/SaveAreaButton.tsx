'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SaveAreaButton({ areaId, areaName }: { areaId: string, areaName: string }) {
  const t = useTranslations('area');
  const [isSaved, setIsSaved] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedAreas = JSON.parse(localStorage.getItem('saved_areas') || '[]');
    setIsSaved(savedAreas.some((a: any) => a.id === areaId));
  }, [areaId]);

  const toggleSave = () => {
    const savedAreas = JSON.parse(localStorage.getItem('saved_areas') || '[]');
    let newSavedAreas;
    
    if (isSaved) {
      newSavedAreas = savedAreas.filter((a: any) => a.id !== areaId);
    } else {
      newSavedAreas = [...savedAreas, { id: areaId, name: areaName }];
    }
    
    localStorage.setItem('saved_areas', JSON.stringify(newSavedAreas));
    setIsSaved(!isSaved);
    window.dispatchEvent(new Event('saved_areas_changed'));
  };

  if (!isMounted) {
    return (
      <Button variant="outline" size="sm" className="gap-2 invisible">
        <Bookmark className="w-4 h-4" />
        {t('pin')}
      </Button>
    );
  }

  return (
    <Button 
      variant={isSaved ? "secondary" : "outline"} 
      size="sm" 
      onClick={toggleSave}
      className={`gap-2 ${isSaved ? 'bg-primary-dark/10 text-primary-dark hover:bg-primary-dark/20' : ''}`}
    >
      {isSaved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
      {isSaved ? t('unpin') : t('pin')}
    </Button>
  );
}
