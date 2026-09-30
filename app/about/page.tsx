import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations();
  
  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-lg border shadow-sm">
      <h1 className="text-2xl font-bold text-primary">เกี่ยวกับ น้ำวอทช์</h1>
      
      <div className="flex flex-col gap-4 text-text">
        <section>
          <h2 className="text-lg font-semibold mb-2">แหล่งข้อมูล</h2>
          <p>ข้อมูลระดับน้ำทั้งหมดได้รับการสนับสนุนจาก <strong>{t('attribution')}</strong></p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>สถานีแม่น้ำและคลองในกรุงเทพมหานครและปทุมธานี</li>
            <li>ความถี่ในการอัปเดตข้อมูล: ประมาณทุกๆ 30 นาที</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">ข้อจำกัดความรับผิดชอบ</h2>
          <p className="text-amber-700 bg-amber-50 p-4 rounded-md border border-amber-200">
            {t('disclaimer')}
          </p>
        </section>
      </div>
    </div>
  );
}
