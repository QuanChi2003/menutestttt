'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast' // 👈 thêm toast

// Thêm type union cho trạng thái để khớp với DB
const STATUSES = ['new','preparing','done','cancelled'] as const
type Status = typeof STATUSES[number]

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([])
  const [itemsByOrder, setItemsByOrder] = useState<Record<string, any[]>>({})

  async function load() {
    const { data: ord, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending:false })
      .limit(50)
    if (error) {
      console.error(error)
      toast.error(error.message)
    }
    setOrders(ord||[])

    const ids = (ord||[]).map(o=>o.id)
    if (ids.length) {
      const { data: it, error: e2 } = await supabase
        .from('order_items')
        .select('*')
        .in('order_id', ids)
      if (e2) {
        console.error(e2)
        toast.error(e2.message)
      }
      const map: Record<string, any[]> = {}
      ;(it||[]).forEach(x=>{
        map[x.order_id] = map[x.order_id] || []
        map[x.order_id].push(x)
      })
      setItemsByOrder(map)
    }
  }

  useEffect(()=>{ 
    load()
    const s = supabase
      .channel('orders')
      .on('postgres_changes', { event:'*', schema:'public', table:'orders' }, load)
      .subscribe()
    return ()=>{ supabase.removeChannel(s) }
  }, [])

  // Sửa kiểu 'status' thành union Status
  async function updateStatus(id: string, status: Status) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Đã cập nhật trạng thái')
    }
  }

  return (
    <div className="card p-4">
      <h2 className="text-xl font-semibold mb-3">Đơn hàng mới nhất</h2>
      <div className="space-y-3">
        {orders.map(o=>(
          <div key={o.id} className="border rounded p-3">
            <div className="flex justify-between">
              <div className="font-medium">
                #{o.id.slice(0,6)} — {o.type==='dine-in' ? `Bàn ${o.table_number}` : `${o.customer_name} • ${o.phone}`}
              </div>

              {/* Ép kiểu value/onChange theo Status */}
              <select
                className="border rounded px-2"
                value={o.status as Status}
                onChange={e=>updateStatus(o.id, e.target.value as Status)}
              >
                <option value="new">Mới</option>
                <option value="preparing">Đang làm</option>
                <option value="done">Hoàn tất</option>
                <option value="cancelled">Hủy</option>
              </select>
            </div>

            <div className="text-sm text-leaf-700">{new Date(o.created_at).toLocaleString('vi-VN')}</div>
            <ul className="list-disc pl-6 my-2">
              {(itemsByOrder[o.id]||[]).map(i=>(
                <li key={i.id}>{i.qty} × {i.dish_id} — {(i.price*i.qty).toLocaleString('vi-VN')}đ</li>
              ))}
            </ul>
            <div className="font-bold text-right">Tổng: {o.total.toLocaleString('vi-VN')}đ</div>
          </div>
        ))}
      </div>
    </div>
  )
}
