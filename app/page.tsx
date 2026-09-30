import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-primary">{t('title')}</h1>
        <p className="text-muted">{t('subtitle')}</p>
      </div>

      <div className="flex bg-surface p-1 rounded-lg">
        <button className="flex-1 py-2 text-center bg-primary text-white rounded-md shadow-sm font-medium">
          {t('switchProvince.bkk')}
        </button>
        <button className="flex-1 py-2 text-center text-text hover:bg-white/50 rounded-md font-medium">
          {t('switchProvince.ptt')}
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Placeholder for Area List */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
