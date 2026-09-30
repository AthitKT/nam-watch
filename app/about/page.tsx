import { Link } from '@/i18n/routing';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex items-center gap-2 text-muted">
        <Link href="/" className="hover:text-primary transition-colors p-1 -ml-1 flex items-center">
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="text-sm font-medium">ย้อนกลับ</span>
        </Link>
      </div>
      
      <div className="bg-white border rounded-lg p-6 flex flex-col gap-8 shadow-sm">
        <div className="flex flex-col gap-2 border-b pb-6">
          <h1 className="text-2xl font-bold text-primary-dark">{t('title')}</h1>
          <p className="text-text">{t('description')}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-primary-dark">{t('methodologyTitle')}</h2>
          <p className="text-sm text-text leading-relaxed">
            {t('methodologyText')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-primary-dark">{t('attributionTitle')}</h2>
          <p className="text-sm text-text">
            {t('attributionText')}
          </p>
        </div>

        <div className="flex flex-col gap-3 bg-red-50 p-4 rounded-md border border-red-100">
          <h2 className="text-sm font-bold text-status-critical">{t('disclaimerTitle')}</h2>
          <p className="text-sm text-status-critical leading-relaxed">
            {t('disclaimerText')}
          </p>
        </div>
      </div>
    </div>
  );
}
