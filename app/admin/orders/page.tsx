'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([])
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, any[]>>({})

  async function load() {
    const { data: ord, error } = await supabase.from('orders').select('*').order('created_at', { ascending:false }).limit(50)
    if (error) console.error(error)
    setOrders(ord||[])
    const ids = (ord||[]).map(o=>o.id)
    if (ids.length) {
      const { data: it, error: e2 } = await supabase.from('order_items').select('*').in('order_id', ids)
      if (e2) console.error(e2)
      const map: Record<string, any[]> = {}
      ;(it||[]).forEach(x=>{
        map[x.order_id] = map[x.order_id] || []
        map[x.order_id].push(x)
      })
      setItemsByOrder(map)
    }
  }
  useEffect(()=>{ load(); const s = supabase.channel('orders').on('postgres_changes', { event:'*', schema:'public', table:'orders' }, load).subscribe(); return ()=>{ supabase.removeChannel(s) }}, [])

  async function updateStatus(id:string, status:string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) alert(error.message)
  }

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Đơn hàng mới nhất</h2>
      <div className="space-y-3">
        {orders.map(o=>(
          <div key={o.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div className="font-medium">#{o.id.slice(0,6)} — {o.type==='dine-in' ? `Bàn ${o.table_number}` : `${o.customer_name} • ${o.phone}`}</div>
              <select className="border rounded px-2" value={o.status} onChange={e=>updateStatus(o.id, e.target.value)}>
                <option value="new">Mới</option>
                <option value="preparing">Đang làm</option>
                <option value="done">Hoàn tất</option>
                <option value="cancelled">Hủy</option>
              </select>
            </div>
            <div className="text-sm text-leaf-700">{new Date(o.created_at).toLocaleString()}</div>
            <ul className="list-disc pl-6 my-2">
              {(itemsByOrder[o.id]||[]).map(i=>(
                <li key={i.id}>{i.qty} × {i.dish_id} — {(i.price*i.qty).toLocaleString()}đ</li>
              ))}
            </ul>
            <div className="font-bold text-right">Tổng: {o.total.toLocaleString()}đ</div>
          </div>
        ))}
      </div>
    </div>
  )
}
