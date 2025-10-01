'use client'
import { useEffect, useState } from 'react'

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const [type, setType] = useState<'dine-in'|'delivery'>('dine-in')
  const [form, setForm] = useState<any>({ table_number:'', customer_name:'', phone:'', address:'', note:'' })

  useEffect(()=>{
    const c = JSON.parse(localStorage.getItem('cart')||'[]')
    setCart(c)
  }, [])

  const total = cart.reduce((s, i)=> s + i.price * i.qty, 0)

  function updateQty(id:string, qty:number){
    const c = cart.map(i=> i.id===id ? {...i, qty} : i)
    setCart(c); localStorage.setItem('cart', JSON.stringify(c))
  }

  async function checkout() {
    if (cart.length===0) return alert('Giỏ hàng trống')
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ type, form, cart })
    })
    if (!res.ok) {
      const t = await res.text()
      return alert('Lỗi tạo đơn: ' + t)
    }
    localStorage.removeItem('cart')
    alert('Đặt món thành công! Quán sẽ liên hệ xác nhận.')
    location.href = '/'
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 card p-4">
        <h2 className="text-xl font-semibold mb-3">Giỏ hàng</h2>
        {cart.length===0 ? <div>Chưa có món nào.</div> : cart.map(i=>(
          <div key={i.id} className="flex items-center gap-3 py-2 border-b">
            <div className="font-medium flex-1">{i.name}</div>
            <input type="number" min={1} value={i.qty} onChange={e=>updateQty(i.id, parseInt(e.target.value)||1)} className="w-16 border rounded px-2 py-1" />
            <div className="w-24 text-right">{(i.price*i.qty).toLocaleString()}đ</div>
          </div>
        ))}
        <div className="text-right font-bold mt-3">Tổng: {total.toLocaleString()}đ</div>
      </div>

      <div className="card p-4 space-y-3">
        <h2 className="text-xl font-semibold">Thông tin đơn</h2>
        <div className="flex gap-3">
          <label className="flex-1 flex items-center gap-2">
            <input type="radio" checked={type==='dine-in'} onChange={()=>setType('dine-in')} /> Tại bàn
          </label>
          <label className="flex-1 flex items-center gap-2">
            <input type="radio" checked={type==='delivery'} onChange={()=>setType('delivery')} /> Đặt ship
          </label>
        </div>
        {type==='dine-in' ? (
          <input className="border rounded px-3 py-2 w-full" placeholder="Số bàn" value={form.table_number||''} onChange={e=>setForm({...form, table_number:e.target.value})} />
        ) : (
          <>
            <input className="border rounded px-3 py-2 w-full" placeholder="Tên khách" value={form.customer_name||''} onChange={e=>setForm({...form, customer_name:e.target.value})} />
            <input className="border rounded px-3 py-2 w-full" placeholder="SĐT" value={form.phone||''} onChange={e=>setForm({...form, phone:e.target.value})} />
            <input className="border rounded px-3 py-2 w-full" placeholder="Địa chỉ" value={form.address||''} onChange={e=>setForm({...form, address:e.target.value})} />
          </>
        )}
        <textarea className="border rounded px-3 py-2 w-full" placeholder="Ghi chú" value={form.note||''} onChange={e=>setForm({...form, note:e.target.value})} />
        <button className="btn w-full" onClick={checkout}>Đặt món</button>
      </div>
    </div>
  )
}
