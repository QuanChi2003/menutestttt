import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/serverSupabase'

async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const groupId = process.env.TELEGRAM_CHAT_ID    // nhóm
  const userId  = process.env.TELEGRAM_USER_ID    // cá nhân (tùy chọn)

  if (!token) return

  const url = `https://api.telegram.org/bot${token}/sendMessage`

  const send = async (chat_id: string | number) => {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text, parse_mode: 'HTML' }),
      })
    } catch (e) {
      console.error('Telegram notify error:', e)
    }
  }

  if (groupId) await send(groupId)
  if (userId) await send(userId)
}

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase()
  const { type, form, cart } = await req.json()

  if (!cart?.length) {
    return new NextResponse('Cart empty', { status: 400 })
  }

  // Tính tổng
  const total = cart.reduce((s: number, i: any) => s + i.price * i.qty, 0)

  // Tạo order
  const { data: order, error } = await supabase.from('orders').insert({
    type,
    table_number: type === 'dine-in' ? form.table_number : null,
    customer_name: type === 'delivery' ? form.customer_name : null,
    phone: type === 'delivery' ? form.phone : null,
    address: type === 'delivery' ? form.address : null,
    note: form.note || null,
    total,
    status: 'new',
  }).select('*').single()

  if (error || !order) {
    return new NextResponse(error?.message || 'Insert order failed', { status: 500 })
  }

  // Lưu items
  const items = cart.map((i: any) => ({
    order_id: order.id,
    dish_id: i.name,
    qty: i.qty,
    price: i.price,
  }))
  const { error: e2 } = await supabase.from('order_items').insert(items)
  if (e2) {
    return new NextResponse(e2.message, { status: 500 })
  }

  // Soạn thông báo Telegram
  const lines = [
    `✅ <b>Đơn mới</b> #${order.id.slice(0, 6)}`,
    type === 'dine-in'
      ? `• Bàn: ${order.table_number}`
      : `• Ship: ${order.customer_name} (${order.phone})\n${order.address}`,
    ...items.map(
      (i) => `• ${i.qty} × ${i.dish_id} — ${(i.price * i.qty).toLocaleString('vi-VN')}đ`
    ),
    `Tổng: <b>${order.total.toLocaleString('vi-VN')}đ</b>`,
    order.note ? `Ghi chú: ${order.note}` : '',
  ].filter(Boolean)

  await notifyTelegram(lines.join('\n'))

  return NextResponse.json({ ok: true, order_id: order.id })
}
