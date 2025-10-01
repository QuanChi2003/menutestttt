'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DishesAdmin() {
  const [list, setList] = useState<any[]>([])
  const [form, setForm] = useState<any>({ name:'', price:0, category:'', is_available:true, image_url:'' })

  async function load() {
    const { data, error } = await supabase.from('dishes').select('*').order('created_at', { ascending:false })
    if (error) console.error(error)
    setList(data||[])
  }
  useEffect(()=>{ load() }, [])

  async function save() {
    if (!form.name || !form.price) return alert('Nhập tên và giá')
    const { error } = await supabase.from('dishes').insert([{ ...form }])
    if (error) return alert(error.message)
    setForm({ name:'', price:0, category:'', is_available:true, image_url:'' })
    load()
  }

  async function remove(id:string) {
    if (!confirm('Xóa món?')) return
    const { error } = await supabase.from('dishes').delete().eq('id', id)
    if (error) return alert(error.message)
    load()
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card p-4 space-y-3">
        <h2 className="text-xl font-semibold">Thêm món</h2>
        <input className="border rounded px-3 py-2 w-full" placeholder="Tên món" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <input type="number" className="border rounded px-3 py-2 w-full" placeholder="Giá" value={form.price} onChange={e=>setForm({...form, price:parseInt(e.target.value)||0})} />
        <input className="border rounded px-3 py-2 w-full" placeholder="Loại" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
        <input className="border rounded px-3 py-2 w-full" placeholder="Ảnh (URL)" value={form.image_url} onChange={e=>setForm({...form, image_url:e.target.value})} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_available} onChange={e=>setForm({...form, is_available:e.target.checked})} />
          Đang bán
        </label>
        <button className="btn w-full" onClick={save}>Lưu</button>
      </div>

      <div className="md:col-span-2 card p-4">
        <h2 className="text-xl font-semibold mb-3">Danh sách món</h2>
        <div className="space-y-2">
          {list.map(d=>(
            <div key={d.id} className="flex items-center gap-3 border-b py-2">
              <div className="flex-1">
                <div className="font-medium">{d.name} · {d.price.toLocaleString()}đ</div>
                <div className="text-sm text-leaf-700">{d.category} {d.is_available ? '• Đang bán' : '• Ngừng'}</div>
              </div>
              <button className="btn" onClick={()=>remove(d.id)}>Xóa</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
