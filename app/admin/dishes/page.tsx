'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// format: "1000000" -> "1.000.000"
function toVNDInput(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
// parse: "1.000.000" -> 1000000 (number)
function parseVND(text: string) {
  const n = text.replace(/\./g, '')
  return Number(n || 0)
}

export default function DishesAdmin() {
  const [dishes, setDishes] = useState<any[]>([])

  // Form state
  const [name, setName] = useState('')
  const [salePriceText, setSalePriceText] = useState('')
  const [costPriceText, setCostPriceText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [loading, setLoading] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('dishes')
      .select('*')
      .order('created_at', { ascending: false })
    setDishes(data || [])
  }

  useEffect(() => { load() }, [])

  async function addDish(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return alert('Nhập tên món')
    const sale_price = parseVND(salePriceText)
    const cost_price = parseVND(costPriceText)
    if (!sale_price) return alert('Giá bán phải > 0')

    setLoading(true)
    const { error } = await supabase.from('dishes').insert({
      name: name.trim(),
      sale_price,
      cost_price,
      image_url: imageUrl || null,
      category: category || null,
      is_available: isAvailable,
    })
    setLoading(false)
    if (error) return alert(error.message)

    // Reset form + reload
    setName('')
    setSalePriceText('')
    setCostPriceText('')
    setImageUrl('')
    setCategory('')
    setIsAvailable(true)
    load()
  }

  async function removeDish(id: string) {
    if (!confirm('Xóa món này?')) return
    const { error } = await supabase.from('dishes').delete().eq('id', id)
    if (error) return alert(error.message)
    load()
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Form thêm món */}
      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-3">Thêm món</h2>
        <form className="space-y-3" onSubmit={addDish}>
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Tên món"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 w-full"
            inputMode="numeric"
            placeholder="Giá bán (VD: 25.000)"
            value={salePriceText}
            onChange={e => setSalePriceText(toVNDInput(e.target.value))}
          />
          <input
            className="border rounded px-3 py-2 w-full"
            inputMode="numeric"
            placeholder="Giá gốc (VD: 15.000)"
            value={costPriceText}
            onChange={e => setCostPriceText(toVNDInput(e.target.value))}
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Link ảnh (tùy chọn)"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2 w-full"
            placeholder="Danh mục (tùy chọn)"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={e => setIsAvailable(e.target.checked)}
            />
            Hiển thị trong menu
          </label>
          <button className="btn" disabled={loading}>
            {loading ? 'Đang lưu…' : 'Thêm món'}
          </button>
        </form>
      </div>

      {/* Danh sách món */}
      <div className="card p-4">
        <h2 className="text-xl font-semibold mb-3">Danh sách món</h2>
        <div className="space-y-3">
          {dishes.map(d => (
            <div
              key={d.id}
              className="border rounded p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-leaf-700">
                  Bán: {Number(d.sale_price).toLocaleString('vi-VN')}đ
                  {d.category ? ` • ${d.category}` : ''}
                  {!d.is_available ? ' • (ẩn)' : ''}
                </div>
                <div className="text-xs text-gray-500">
                  Giá gốc: {Number(d.cost_price).toLocaleString('vi-VN')}đ
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={d.image_url || '#'}
                  target="_blank"
                  className="text-sm underline"
                  rel="noreferrer"
                >
                  Ảnh
                </a>
                <button className="btn" onClick={() => removeDish(d.id)}>
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {!dishes.length && (
            <div className="text-sm text-leaf-700">Chưa có món nào.</div>
          )}
        </div>
      </div>
    </div>
  )
}
