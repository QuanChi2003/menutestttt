import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <Link href="/" className="btn">← Về trang chủ</Link>
        <Link href="/admin" className="btn">Bảng điều khiển</Link>
        <Link href="/admin/stats" className="btn">Báo cáo</Link>
      </div>
      {children}
    </div>
  );
}
