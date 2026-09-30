import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="inline-flex items-center text-muted hover:text-primary transition-colors">
        <ChevronLeft className="w-5 h-5 mr-1" />
        <span className="text-sm font-medium">ย้อนกลับ</span>
      </Link>
      <div className="bg-surface border border-dashed rounded-lg p-12 text-center flex flex-col gap-4">
        <h1 className="text-xl font-bold text-primary-dark">เกี่ยวกับโครงการ</h1>
        <p className="text-muted">ระบบติดตามระดับน้ำสำหรับกรุงเทพมหานคร และ ปทุมธานี</p>
        <p className="text-xs text-status-watch mt-4">{t('disclaimer')}</p>
      </div>
    </div>
  );
}
