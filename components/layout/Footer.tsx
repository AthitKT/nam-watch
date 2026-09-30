import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();
  
  return (
    <footer className="bg-surface text-muted p-6 text-center text-sm border-t mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        <p className="font-medium text-amber-600">{t('disclaimer')}</p>
        <p>{t('attribution')}</p>
      </div>
    </footer>
  );
}
