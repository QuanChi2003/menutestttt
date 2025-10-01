'use client'
import Image from 'next/image'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function DishCard({ dish, onAdd }:{ dish: any, onAdd: (dish:any)=>void }) {
  const [qty, setQty] = useState(1)

  function handleAdd() {
    onAdd({ ...dish, qty })
    toast.success(`Đã thêm ${qty} × ${dish.name} vào giỏ!`)
  }

  return (
    <div className="card p-4 flex flex-col">
      {dish.image_url && (
        <div className="relative w-full h-44 mb-3 overflow-hidden rounded-lg">
          <Image src={dish.image_url} alt={dish.name} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1">
        <div className="font-semibold text-lg">{dish.name}</div>
        <div className="text-leaf-700">{dish.category}</div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="font-bold">{dish.price.toLocaleString('vi-VN')}đ</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={qty}
            onChange={e=>setQty(parseInt(e.target.value)||1)}
            className="w-16 border rounded px-2 py-1"
          />
          <button className="btn" onClick={handleAdd}>Thêm</button>
        </div>
      </div>
    </div>
  )
}
