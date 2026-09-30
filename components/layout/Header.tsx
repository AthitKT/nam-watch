import { Link } from '@/i18n/routing';

export function Header() {
  return (
    <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">น้ำวอทช์</Link>
        <nav className="flex gap-4">
          <Link href="/" className="hover:underline">หน้าแรก</Link>
          <Link href="/map" className="hover:underline">แผนที่</Link>
          <Link href="/about" className="hover:underline">เกี่ยวกับ</Link>
        </nav>
      </div>
    </header>
  );
}
