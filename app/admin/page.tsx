import Link from 'next/link'

export default function AdminHome() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Link href="/admin/dishes" className="card p-6 hover:shadow-md transition">
        <div className="text-2xl font-semibold">🍽️ Quản lý món</div>
        <div className="text-leaf-700">Thêm / sửa / xóa món & hình ảnh</div>
      </Link>
      <Link href="/admin/orders" className="card p-6 hover:shadow-md transition">
        <div className="text-2xl font-semibold">🧾 Đơn hàng</div>
        <div className="text-leaf-700">Xem & cập nhật trạng thái</div>
      </Link>
    </div>
  )
}
