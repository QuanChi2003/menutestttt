'use client'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import DishCard from '@/components/DishCard'

export default function Home() {
  const [dishes, setDishes] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'dine-in'|'delivery'>('dine-in')

  useEffect(()=>{
    supabase.from('dishes').select('*').eq('is_available', true).order('created_at', { ascending: false})
      .then(({ data, error })=> {
        if (error) console.error(error)
        setDishes(data||[])
      })
  }, [])

  const filtered = useMemo(()=>{
    return dishes.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || (d.category||'').toLowerCase().includes(search.toLowerCase()))
  }, [dishes, search])

  function addToCart(item:any) {
    const cart = JSON.parse(localStorage.getItem('cart')||'[]')
    const exist = cart.find((c:any)=>c.id===item.id)
    if (exist) exist.qty += item.qty
    else cart.push({ 
  id: item.id, 
  name: item.name, 
  price: item.sale_price ?? item.price ?? 0, 
  image_url: item.image_url, 
  qty: item.qty 
})
    localStorage.setItem('cart', JSON.stringify(cart))
    alert('Đã thêm vào giỏ!')
  }

  return (
    <div className="space-y-6">
      <section className="card p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <input placeholder="Tìm món hoặc loại..." className="border rounded px-3 py-2 flex-1" value={search} onChange={e=>setSearch(e.target.value)} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input type="radio" checked={type==='dine-in'} onChange={()=>setType('dine-in')} />
              Tại bàn
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={type==='delivery'} onChange={()=>setType('delivery')} />
              Đặt ship
            </label>
          </div>
          <a className="btn" href="/cart">Xem giỏ hàng</a>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(d => (
          <DishCard key={d.id} dish={d} onAdd={addToCart} />
        ))}
      </div>
    </div>
  )
}
